import { NextResponse } from "next/server";
import { guardAdminMutation, jsonError } from "@/lib/admin-services";
import { revalidatePublicServices, serializeService } from "@/lib/services";
import { reorderServices } from "@/lib/service-store";
import { reorderServicesSchema, zodFieldErrors } from "@/lib/validation";

export async function PATCH(request: Request) {
  const auth = await guardAdminMutation(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Некорректный запрос.");
  }

  const parsed = reorderServicesSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "Проверьте список услуг.",
      zodFieldErrors(parsed.error),
    );
  }

  const ids = parsed.data.ids;
  if (new Set(ids).size !== ids.length) {
    return jsonError(
      400,
      "В списке порядка есть повторяющиеся идентификаторы.",
    );
  }

  const services = await reorderServices(ids);
  if (!services) {
    return jsonError(
      400,
      "Список порядка должен содержать все существующие услуги ровно по одному разу.",
    );
  }

  revalidatePublicServices();
  return NextResponse.json({ services: services.map(serializeService) });
}
