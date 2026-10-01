import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdminResponse,
  requireSameOriginResponse,
} from "@/lib/admin-route";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { getAdminRecord, updateAdminPassword } from "@/lib/admin-store";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z
    .string()
    .min(10, "Новый пароль должен содержать не менее 10 символов.")
    .max(1024),
  confirmation: z.string().min(1).max(1024),
});

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdminResponse();
  if (!auth.ok) return auth.response;

  const csrfResponse = requireSameOriginResponse(request);
  if (csrfResponse) return csrfResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный запрос." },
      { status: 400 },
    );
  }

  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Проверьте пароль." },
      { status: 400 },
    );
  }

  if (parsed.data.newPassword !== parsed.data.confirmation) {
    return NextResponse.json(
      { error: "Новый пароль и подтверждение не совпадают." },
      { status: 400 },
    );
  }

  const admin = await getAdminRecord();
  if (admin.login !== auth.session.sub) {
    return NextResponse.json(
      { error: "Сессия недействительна. Войдите снова." },
      { status: 401 },
    );
  }

  const currentPasswordMatches = await bcrypt.compare(
    parsed.data.currentPassword,
    admin.passwordHash,
  );
  if (!currentPasswordMatches) {
    return NextResponse.json(
      { error: "Текущий пароль указан неверно." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  const updated = await updateAdminPassword(
    admin.login,
    admin.passwordHash,
    passwordHash,
  );
  if (!updated) {
    return NextResponse.json(
      { error: "Пароль изменён в другой сессии. Войдите снова." },
      { status: 409 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
