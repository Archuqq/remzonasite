import { NextResponse } from "next/server";
import {
  requireAdminResponse,
  requireSameOriginResponse,
} from "@/lib/admin-route";
import type { ServiceFields } from "@/lib/validation";
import { serviceFieldsSchema, zodFieldErrors } from "@/lib/validation";

export async function guardAdminMutation(request: Request) {
  const auth = await requireAdminResponse();
  if (!auth.ok) return { ok: false as const, response: auth.response };

  const csrfResponse = requireSameOriginResponse(request);
  if (csrfResponse) return { ok: false as const, response: csrfResponse };

  return { ok: true as const };
}

export async function guardAdminRead() {
  const auth = await requireAdminResponse();
  if (!auth.ok) return { ok: false as const, response: auth.response };
  return { ok: true as const };
}

export function jsonError(
  status: number,
  error: string,
  fields?: Record<string, string>,
) {
  return NextResponse.json(fields ? { error, fields } : { error }, { status });
}

function parsePublished(value: FormDataEntryValue | null): boolean {
  if (value === null) return true;
  const raw = String(value).toLowerCase();
  if (raw === "false" || raw === "0" || raw === "off") return false;
  return true;
}

export function parseServiceFormData(formData: FormData): {
  success: true;
  data: ServiceFields;
  file: File | null;
} | {
  success: false;
  response: NextResponse;
} {
  const parsed = serviceFieldsSchema.safeParse({
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    duration: String(formData.get("duration") ?? ""),
    imageAlt: String(formData.get("imageAlt") ?? ""),
    isPublished: parsePublished(formData.get("isPublished")),
  });

  if (!parsed.success) {
    return {
      success: false,
      response: jsonError(
        400,
        "Проверьте поля формы.",
        zodFieldErrors(parsed.error),
      ),
    };
  }

  const image = formData.get("image");
  const file =
    image instanceof File && image.size > 0 ? image : null;

  return { success: true, data: parsed.data, file };
}

export async function readOptionalImageBuffer(
  file: File | null,
): Promise<
  { ok: true; buffer: Buffer | null } | { ok: false; response: NextResponse }
> {
  if (!file) return { ok: true, buffer: null };

  try {
    return { ok: true, buffer: Buffer.from(await file.arrayBuffer()) };
  } catch {
    return {
      ok: false,
      response: jsonError(400, "Не удалось прочитать файл изображения.", {
        image: "Не удалось прочитать файл изображения.",
      }),
    };
  }
}
