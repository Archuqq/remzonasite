import { NextResponse } from "next/server";
import { guardAdminMutation, jsonError } from "@/lib/admin-services";
import { revalidatePublicServices, serializeService } from "@/lib/services";
import { setServicePublished } from "@/lib/service-store";
import { publishServiceSchema, zodFieldErrors } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await guardAdminMutation(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Некорректный запрос.");
  }

  const parsed = publishServiceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "Проверьте поля формы.",
      zodFieldErrors(parsed.error),
    );
  }

  const service = await setServicePublished(id, parsed.data.isPublished);
  if (!service) return jsonError(404, "Услуга не найдена.");

  revalidatePublicServices();
  return NextResponse.json({ service: serializeService(service) });
}
