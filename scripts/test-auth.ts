import assert from "node:assert/strict";

process.env.SESSION_SECRET = "test-session-secret-that-is-at-least-32-chars";
const siteUrl = "https://remzona.example";
process.env.SITE_URL = siteUrl;

async function main() {
  const [session, rateLimit, csrf, proxyModule, { SignJWT }] =
    await Promise.all([
      import("../src/lib/admin-session"),
      import("../src/lib/auth-rate-limit"),
      import("../src/lib/csrf"),
      import("../proxy"),
      import("jose"),
    ]);

  const token = await session.createAdminSessionToken({
    adminId: "admin-test-id",
    login: "admin",
  });
  const verified = await session.verifyAdminSessionToken(token);
  assert.equal(verified?.sub, "admin-test-id");
  assert.equal(verified?.login, "admin");
  assert.equal(verified?.role, "admin");
  assert.equal(await session.verifyAdminSessionToken("not-a-jwt"), null);
  assert.equal(await session.verifyAdminSessionToken(undefined), null);

  const expiredToken = await new SignJWT({ login: "admin", role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("remzona-admin")
    .setAudience("remzona-admin")
    .setSubject("admin-test-id")
    .setIssuedAt(Math.floor(Date.now() / 1000) - 60)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  assert.equal(await session.verifyAdminSessionToken(expiredToken), null);
  console.log("PASS JWT signing, verification, tamper and expiration checks");

  const attemptIp = "192.0.2.40";
  const attemptLogin = "rate-limit-test";
  const now = 1_800_000_000_000;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    rateLimit.recordFailedLogin(attemptIp, attemptLogin, now + attempt);
  }
  assert.deepEqual(
    rateLimit.getLoginRateLimit(attemptIp, attemptLogin, now + 10),
    {
      blocked: true,
      retryAfterSeconds: 900,
    },
  );
  assert.equal(
    rateLimit.getLoginRateLimit(attemptIp, `${attemptLogin}-other`, now + 10)
      .blocked,
    false,
  );
  assert.equal(
    rateLimit.getLoginRateLimit(attemptIp, attemptLogin, now + 900_001).blocked,
    false,
  );
  rateLimit.clearLoginFailures(attemptIp, attemptLogin);
  console.log("PASS per-IP/login rate limit window, isolation and expiry");

  assert.equal(
    csrf.isSameOriginMutation(
      new Headers({
        origin: "https://remzona.example",
        host: "remzona.example",
      }),
      siteUrl,
    ),
    true,
  );
  const originalNodeEnv = process.env.NODE_ENV;
  try {
    Reflect.set(process.env, "NODE_ENV", "development");
    assert.equal(
      csrf.isSameOriginMutation(
        new Headers({
          origin: "http://localhost:3000",
          host: "localhost:3000",
        }),
        siteUrl,
      ),
      true,
    );
    Reflect.set(process.env, "NODE_ENV", "production");
    assert.equal(
      csrf.isSameOriginMutation(
        new Headers({
          origin: "http://localhost:3000",
          host: "localhost:3000",
        }),
        siteUrl,
      ),
      false,
    );
  } finally {
    if (originalNodeEnv === undefined) {
      Reflect.deleteProperty(process.env, "NODE_ENV");
    } else {
      Reflect.set(process.env, "NODE_ENV", originalNodeEnv);
    }
  }
  assert.equal(
    csrf.isSameOriginMutation(
      new Headers({
        origin: "https://remzona.example",
        host: "127.0.0.1:3000",
        "x-forwarded-host": "internal-proxy:8080",
      }),
      siteUrl,
    ),
    true,
  );
  assert.equal(
    csrf.isSameOriginMutation(new Headers({ host: "remzona.example" }), siteUrl),
    true,
  );
  assert.equal(
    csrf.isSameOriginMutation(new Headers({ host: "attacker.example" }), siteUrl),
    false,
  );
  assert.equal(
    csrf.isSameOriginMutation(
      new Headers({
        origin: "https://attacker.example",
        host: "remzona.example",
      }),
      siteUrl,
    ),
    false,
  );
  assert.equal(
    csrf.isSameOriginMutation(
      new Headers({
        origin: "https://remzona.example",
        host: "remzona.example",
        "sec-fetch-site": "cross-site",
      }),
      siteUrl,
    ),
    false,
  );
  console.log("PASS same-origin and cross-site CSRF checks");

  const { NextRequest } = await import("next/server");
  const pageResponse = await proxyModule.proxy(
    new NextRequest("https://remzona.example/admin/services"),
  );
  assert.equal(pageResponse.status, 307);
  assert.equal(
    pageResponse.headers.get("location"),
    "https://remzona.example/admin/login",
  );

  const apiResponse = await proxyModule.proxy(
    new NextRequest("https://remzona.example/api/admin/password"),
  );
  assert.equal(apiResponse.status, 401);
  assert.deepEqual(await apiResponse.json(), {
    error: "Требуется авторизация администратора.",
  });

  const loginResponse = await proxyModule.proxy(
    new NextRequest("https://remzona.example/api/admin/login"),
  );
  assert.equal(loginResponse.status, 200);

  const loginPageResponse = await proxyModule.proxy(
    new NextRequest("https://remzona.example/admin/login"),
  );
  assert.equal(loginPageResponse.status, 200);

  const apiRootResponse = await proxyModule.proxy(
    new NextRequest("https://remzona.example/api/admin"),
  );
  assert.equal(apiRootResponse.status, 401);

  const authenticatedRequest = new NextRequest(
    "https://remzona.example/admin/services",
  );
  authenticatedRequest.cookies.set(session.ADMIN_SESSION_COOKIE, token);
  const authenticatedResponse = await proxyModule.proxy(authenticatedRequest);
  assert.equal(authenticatedResponse.status, 200);
  console.log("PASS protected routes, login exceptions and API root response");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
