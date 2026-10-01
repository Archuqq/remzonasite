import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export const ADMIN_SESSION_COOKIE = "remzona_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AdminSession = JWTPayload & {
  sub: string;
  login: string;
  role: "admin";
};

function getSigningKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET должен быть не короче 32 символов.");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(input: {
  adminId: string;
  login: string;
}): Promise<string> {
  return new SignJWT({ login: input.login, role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("remzona-admin")
    .setAudience("remzona-admin")
    .setSubject(input.adminId)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getSigningKey());
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<AdminSession | null> {
  if (!token) return null;

  try {
    const { payload, protectedHeader } = await jwtVerify(
      token,
      getSigningKey(),
      {
        algorithms: ["HS256"],
        issuer: "remzona-admin",
        audience: "remzona-admin",
      },
    );

    if (
      protectedHeader.alg !== "HS256" ||
      payload.role !== "admin" ||
      typeof payload.sub !== "string" ||
      typeof payload.login !== "string"
    ) {
      return null;
    }

    return payload as AdminSession;
  } catch {
    return null;
  }
}
