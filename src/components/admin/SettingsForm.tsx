"use client";

import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import type { SiteSettings } from "@/lib/settings";

type SettingsFormProps = {
  settings: SiteSettings;
};

export function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setSuccess(false);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.get("phone"),
          address: formData.get("address"),
          hoursWeekdays: formData.get("hoursWeekdays"),
          hoursWeekend: formData.get("hoursWeekend"),
          yandexOrgId: formData.get("yandexOrgId"),
          reviewsEnabled: formData.get("reviewsEnabled") === "on",
          siteName: formData.get("siteName"),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        settings?: SiteSettings;
      };

      if (!response.ok || !result.settings) {
        setError(result.error ?? "Не удалось сохранить настройки.");
        return;
      }

      setSettings(result.settings);
      setSuccess(true);
    } catch {
      setError("Не удалось связаться с сервером. Повторите попытку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="max-w-2xl space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          autoComplete="tel"
          label="Телефон"
          name="phone"
          placeholder="+7 (900) 000-00-00"
          value={settings.phone}
          onChange={(phone) => setSettings((current) => ({ ...current, phone }))}
        />
        <div className="space-y-2 text-sm">
          <span className="font-medium text-ink">Ссылка для звонка</span>
          <p className="min-h-12 rounded-md border border-line bg-section-alt px-4 py-3 text-muted">
            {settings.phoneHref}
          </p>
        </div>
      </div>

      <Field
        label="Адрес"
        name="address"
        value={settings.address}
        onChange={(address) => setSettings((current) => ({ ...current, address }))}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Часы работы в будни"
          name="hoursWeekdays"
          value={settings.hoursWeekdays}
          onChange={(hoursWeekdays) =>
            setSettings((current) => ({ ...current, hoursWeekdays }))
          }
        />
        <Field
          label="Часы работы в выходные"
          name="hoursWeekend"
          value={settings.hoursWeekend}
          onChange={(hoursWeekend) =>
            setSettings((current) => ({ ...current, hoursWeekend }))
          }
        />
      </div>

      <Field
        inputMode="numeric"
        label="ID организации Яндекс"
        name="yandexOrgId"
        value={settings.yandexOrgId}
        onChange={(yandexOrgId) =>
          setSettings((current) => ({ ...current, yandexOrgId }))
        }
      />

      <Field
        label="SEO-название сайта"
        name="siteName"
        value={settings.siteName}
        onChange={(siteName) => setSettings((current) => ({ ...current, siteName }))}
      />

      <label className="flex min-h-12 items-center gap-3 text-sm font-medium text-ink">
        <input
          className="size-5 accent-ink"
          checked={settings.reviewsEnabled}
          name="reviewsEnabled"
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              reviewsEnabled: event.target.checked,
            }))
          }
          type="checkbox"
        />
        Показывать отзывы на сайте
      </label>
      <p className="-mt-3 text-sm leading-6 text-muted">
        При выключении секция отзывов, iframe и ссылки «Отзывы» исчезнут с публичного сайта.
      </p>

      {success ? (
        <p className="rounded-md border border-line bg-section-alt px-4 py-3 text-sm text-ink">
          Настройки сохранены. Публичный сайт обновлён.
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-md border border-line bg-section-alt px-4 py-3 text-sm text-ink"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        className="min-h-12 rounded-md bg-ink px-6 text-sm font-semibold text-white transition hover:bg-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Сохраняем…" : "Сохранить настройки"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  ...inputProps
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange">) {
  return (
    <label className="block space-y-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        {...inputProps}
        className="min-h-12 w-full rounded-md border border-line bg-white px-4 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required
        value={value}
      />
    </label>
  );
}