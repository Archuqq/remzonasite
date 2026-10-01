import { NextResponse } from "next/server";
import { UnauthorizedError, requireAdmin } from "@/lib/auth";
import type { AdminSession } from "@/lib/admin-session";
import { isSameOriginMutation } from "@/lib/csrf";
import { env } from "@/lib/env";

export async function requireAdminResponse(): Promise<
  { ok: true; session: AdminSession } | { ok: false; response: NextResponse }
> {
  try {
    const session = await requireAdmin();
    return { ok: true, session };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Требуется авторизация администратора." },
          { status: 401 },
        ),
      };
    }

    throw error;
  }
}

export function requireSameOriginResponse(
  request: Request,
): NextResponse | null {
  if (!isSameOriginMutation(request.headers, env.SITE_URL)) {
    return NextResponse.json(
      { error: "Запрос отклонён проверкой безопасности." },
      { status: 403 },
    );
  }

  return null;
}
