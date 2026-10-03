import { z } from "zod";

export const serviceFieldLimits = {
  category: 40,
  title: 100,
  description: 300,
  price: 40,
  duration: 40,
  imageAlt: 160,
} as const;

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Заполните поле «${label}».`)
    .max(max, `Поле «${label}» — не больше ${max} символов.`);

export const serviceFieldsSchema = z.object({
  category: requiredText("Категория", serviceFieldLimits.category),
  title: requiredText("Название", serviceFieldLimits.title),
  description: requiredText("Описание", serviceFieldLimits.description),
  price: requiredText("Цена", serviceFieldLimits.price),
  duration: requiredText("Длительность", serviceFieldLimits.duration),
  imageAlt: z
    .string()
    .trim()
    .max(
      serviceFieldLimits.imageAlt,
      `Поле «Подпись к фото» — не больше ${serviceFieldLimits.imageAlt} символов.`,
    ),
  isPublished: z.boolean(),
});

export type ServiceFields = z.infer<typeof serviceFieldsSchema>;

export const reorderServicesSchema = z.object({
  ids: z
    .array(z.string().min(1, "Некорректный идентификатор услуги."))
    .min(1, "Передайте список идентификаторов."),
});

export const publishServiceSchema = z.object({
  isPublished: z.boolean(),
});

export const siteSettingsSchema = z.object({
  phone: z.string().trim().min(1, "Укажите телефон.").max(40, "Телефон слишком длинный."),
  address: z.string().trim().min(1, "Укажите адрес.").max(300, "Адрес слишком длинный."),
  hoursWeekdays: z
    .string()
    .trim()
    .min(1, "Укажите часы работы в будни.")
    .max(100, "Часы работы в будни слишком длинные."),
  hoursWeekend: z
    .string()
    .trim()
    .max(100, "Часы работы в выходные слишком длинные."),
  yandexOrgId: z
    .string()
    .trim()
    .regex(/^\d+$/, "ID организации Яндекс должен содержать только цифры.")
    .max(30, "ID организации Яндекс слишком длинный."),
  reviewsEnabled: z.boolean(),
  siteName: z.string().trim().min(1, "Укажите SEO-название сайта.").max(160, "SEO-название слишком длинное."),
});

export type SiteSettingsFields = z.infer<typeof siteSettingsSchema>;

export function normalizeRussianPhone(value: string): string | null {
  if (/[^\d\s()+-]/.test(value)) return null;

  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("8")
    ? `7${digits.slice(1)}`
    : digits.startsWith("7")
      ? digits
      : `7${digits}`;

  if (!/^7\d{10}$/.test(normalized)) return null;
  return `tel:+${normalized}`;
}

export function zodFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
