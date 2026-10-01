import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  type AdminSession,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export class UnauthorizedError extends Error {
  constructor() {
    super("Требуется авторизация администратора.");
    this.name = "UnauthorizedError";
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);

  if (!session) throw new UnauthorizedError();
  return session;
}
