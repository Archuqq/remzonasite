import { NextResponse } from "next/server";
import {
  requireAdminResponse,
  requireSameOriginResponse,
} from "@/lib/admin-route";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireAdminResponse();
  if (!auth.ok) return auth.response;

  const csrfResponse = requireSameOriginResponse(request);
  if (csrfResponse) return csrfResponse;

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
