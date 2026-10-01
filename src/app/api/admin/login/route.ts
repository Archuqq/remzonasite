import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSameOriginMutation } from "@/lib/csrf";
import { env } from "@/lib/env";
import {
  clearLoginFailures,
  getLoginRateLimit,
  recordFailedLogin,
} from "@/lib/auth-rate-limit";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
} from "@/lib/admin-session";
import { getAdminRecord } from "@/lib/admin-store";

export const runtime = "nodejs";

const loginSchema = z.object({
  login: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(1024),
});

const dummyPasswordHash = bcrypt.hash(
  "remzona-invalid-account-password-check",
  12,
);

function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOriginMutation(request.headers, env.SITE_URL)) {
    return NextResponse.json(
      { error: "Запрос отклонён проверкой безопасности." },
      { status: 403 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json(
      { error: "Некорректный запрос." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный запрос." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Введите логин и пароль." },
      { status: 400 },
    );
  }

  const { login, password } = parsed.data;
  const ipAddress = getClientIp(request);
  const limit = getLoginRateLimit(ipAddress, login);

  if (limit.blocked) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Повторите через 15 минут." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const admin = await getAdminRecord();
  const loginMatches = admin.login === login;
  const passwordHash = loginMatches
    ? admin.passwordHash
    : await dummyPasswordHash;
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!loginMatches || !passwordMatches) {
    recordFailedLogin(ipAddress, login);
    return NextResponse.json(
      { error: "Неверный логин или пароль." },
      { status: 401 },
    );
  }

  clearLoginFailures(ipAddress, login);
  const token = await createAdminSessionToken({
    adminId: admin.login,
    login: admin.login,
  });
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: "/",
  });

  return response;
}
