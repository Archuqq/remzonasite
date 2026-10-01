import { NextResponse } from "next/server";
import { guardAdminMutation, guardAdminRead, jsonError } from "@/lib/admin-services";
import { updateSettings, getSettings } from "@/lib/settings";
import {
  normalizeRussianPhone,
  siteSettingsSchema,
  zodFieldErrors,
} from "@/lib/validation";

export async function GET() {
  const auth = await guardAdminRead();
  if (!auth.ok) return auth.response;

  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(request: Request) {
  const auth = await guardAdminMutation(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Некорректный запрос.");
  }

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      "Проверьте поля настроек.",
      zodFieldErrors(parsed.error),
    );
  }

  const phoneHref = normalizeRussianPhone(parsed.data.phone);
  if (!phoneHref) {
    return jsonError(400, "Укажите корректный российский номер телефона.", {
      phone: "Формат: +7 (900) 000-00-00.",
    });
  }

  const settings = await updateSettings({
    ...parsed.data,
    phoneHref,
  });

  return NextResponse.json({ settings });
}