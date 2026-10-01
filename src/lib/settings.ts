import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import {
  getDataFilePath,
  readJsonFile,
  updateJsonFile,
} from "@/lib/json-store";

export const SETTINGS_CACHE_TAG = "settings";

const settingsFileSchema = z.record(z.string(), z.string());

/** Ключи полей в data/settings.json. */
export const SETTING_KEYS = {
  phone: "phone",
  phoneHref: "phone_href",
  address: "address",
  hoursWeekdays: "hours_weekdays",
  hoursWeekend: "hours_weekend",
  yandexOrgId: "yandex_org_id",
  reviewsEnabled: "reviews_enabled",
  siteName: "site_name",
} as const;

export type SiteSettings = {
  phone: string;
  phoneHref: string;
  address: string;
  hoursWeekdays: string;
  hoursWeekend: string;
  yandexOrgId: string;
  reviewsEnabled: boolean;
  siteName: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "+7 (900) 000-00-00",
  phoneHref: "tel:+79000000000",
  address: "г. Серпухов, Советская улица, 2кА",
  hoursWeekdays: "Пн–Пт: 09:00–20:00",
  hoursWeekend: "Сб–Вс: 10:00–20:00",
  yandexOrgId: "73425839561",
  reviewsEnabled: true,
  siteName: "РЕМЗОНА",
};

export const DEFAULT_STORED_SETTINGS: Record<string, string> = {
  [SETTING_KEYS.phone]: DEFAULT_SETTINGS.phone,
  [SETTING_KEYS.phoneHref]: DEFAULT_SETTINGS.phoneHref,
  [SETTING_KEYS.address]: DEFAULT_SETTINGS.address,
  [SETTING_KEYS.hoursWeekdays]: DEFAULT_SETTINGS.hoursWeekdays,
  [SETTING_KEYS.hoursWeekend]: DEFAULT_SETTINGS.hoursWeekend,
  [SETTING_KEYS.yandexOrgId]: DEFAULT_SETTINGS.yandexOrgId,
  [SETTING_KEYS.reviewsEnabled]: "true",
  [SETTING_KEYS.siteName]: DEFAULT_SETTINGS.siteName,
};

function storedToSettings(stored: Record<string, string>): SiteSettings {
  const flag = stored[SETTING_KEYS.reviewsEnabled];
  return {
    phone: stored[SETTING_KEYS.phone] ?? DEFAULT_SETTINGS.phone,
    phoneHref: stored[SETTING_KEYS.phoneHref] ?? DEFAULT_SETTINGS.phoneHref,
    address: stored[SETTING_KEYS.address] ?? DEFAULT_SETTINGS.address,
    hoursWeekdays:
      stored[SETTING_KEYS.hoursWeekdays] ?? DEFAULT_SETTINGS.hoursWeekdays,
    hoursWeekend:
      stored[SETTING_KEYS.hoursWeekend] ?? DEFAULT_SETTINGS.hoursWeekend,
    yandexOrgId:
      stored[SETTING_KEYS.yandexOrgId] ?? DEFAULT_SETTINGS.yandexOrgId,
    reviewsEnabled:
      flag === undefined ? DEFAULT_SETTINGS.reviewsEnabled : flag === "true",
    siteName: stored[SETTING_KEYS.siteName] ?? DEFAULT_SETTINGS.siteName,
  };
}

function settingsToStored(settings: SiteSettings): Record<string, string> {
  return {
    [SETTING_KEYS.phone]: settings.phone,
    [SETTING_KEYS.phoneHref]: settings.phoneHref,
    [SETTING_KEYS.address]: settings.address,
    [SETTING_KEYS.hoursWeekdays]: settings.hoursWeekdays,
    [SETTING_KEYS.hoursWeekend]: settings.hoursWeekend,
    [SETTING_KEYS.yandexOrgId]: settings.yandexOrgId,
    [SETTING_KEYS.reviewsEnabled]: settings.reviewsEnabled ? "true" : "false",
    [SETTING_KEYS.siteName]: settings.siteName,
  };
}

async function loadSettingsFromFile(): Promise<SiteSettings> {
  const stored = await readJsonFile(
    await getDataFilePath("settings.json"),
    settingsFileSchema,
    DEFAULT_STORED_SETTINGS,
  );
  return storedToSettings(stored);
}

/**
 * Все настройки сайта. Кэш Next.js с тегом `settings`.
 * Вход: нет. Выход: SiteSettings (пропуски в файле заполняются DEFAULT_SETTINGS).
 */
export const getSettings = unstable_cache(
  loadSettingsFromFile,
  ["site-settings-json-v4"],
  { tags: [SETTINGS_CACHE_TAG] },
);

/**
 * Частичное обновление настроек. Пишет только переданные поля.
 * Вход: Partial<SiteSettings>. Выход: актуальный снимок без кэша.
 */
export async function updateSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const filePath = await getDataFilePath("settings.json");
  const next = await updateJsonFile(
    filePath,
    settingsFileSchema,
    DEFAULT_STORED_SETTINGS,
    (stored) => {
      const settings = { ...storedToSettings(stored), ...patch };
      const nextStored = {
        ...stored,
        ...settingsToStored(settings),
      };
      return { data: nextStored, result: settings };
    },
  );
  revalidateTag(SETTINGS_CACHE_TAG, "max");
  revalidatePath("/");
  return next;
}
