import assert from "node:assert/strict";
import { slugifyTitle } from "../src/lib/slug";
import {
  serviceFieldsSchema,
  siteSettingsSchema,
} from "../src/lib/validation";

const validService = {
  category: "ДИАГНОСТИКА",
  title: "Компьютерная диагностика",
  description: "Проверка систем автомобиля.",
  price: "от 1 500 ₽",
  duration: "30–60 мин",
  imageAlt: "",
  isPublished: true,
};

assert.equal(
  slugifyTitle("Компьютерная диагностика"),
  "kompyuternaya-diagnostika",
);
assert.equal(
  slugifyTitle("Кузовной ремонт и покраска"),
  "kuzovnoy-remont-i-pokraska",
);
assert.equal(slugifyTitle("Ёлка, щётки / ТО"), "yolka-shchyotki-to");
assert.equal(slugifyTitle("!!!"), "usluga");
assert.ok(slugifyTitle("а".repeat(120)).length <= 80);
console.log("PASS title transliteration, punctuation, fallback and max length");

assert.equal(serviceFieldsSchema.safeParse(validService).success, true);
assert.equal(
  serviceFieldsSchema.safeParse({ ...validService, imageAlt: "" }).success,
  true,
);

for (const [field, value] of [
  ["category", "а".repeat(41)],
  ["title", "а".repeat(101)],
  ["description", "а".repeat(301)],
  ["price", "а".repeat(41)],
  ["duration", "а".repeat(41)],
] as const) {
  assert.equal(
    serviceFieldsSchema.safeParse({ ...validService, [field]: value }).success,
    false,
    `${field} should enforce its maximum length`,
  );
}

assert.equal(
  serviceFieldsSchema.safeParse({ ...validService, isPublished: "true" })
    .success,
  false,
);
console.log("PASS service field boundaries and publication type validation");

const validSettings = {
  phone: "+7 (900) 000-00-00",
  address: "г. Серпухов, Советская улица, 2кА",
  hoursWeekdays: "Пн–Пт: 09:00–20:00",
  hoursWeekend: "",
  yandexOrgId: "73425839561",
  reviewsEnabled: true,
  siteName: "РЕМЗОНА",
};
assert.equal(siteSettingsSchema.safeParse(validSettings).success, true);
console.log("PASS weekend hours may be left blank");
