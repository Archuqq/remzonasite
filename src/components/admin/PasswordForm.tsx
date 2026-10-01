"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function PasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
          confirmation: formData.get("confirmation"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Не удалось изменить пароль.");
        return;
      }

      router.replace("/admin/login?passwordChanged=1");
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером. Повторите попытку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
      <PasswordField
        autoComplete="current-password"
        label="Текущий пароль"
        name="currentPassword"
      />
      <PasswordField
        autoComplete="new-password"
        label="Новый пароль"
        name="newPassword"
      />
      <PasswordField
        autoComplete="new-password"
        label="Повторите новый пароль"
        name="confirmation"
      />
      <p className="text-sm text-muted">
        Новый пароль должен содержать не менее 10 символов.
      </p>
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
        {isSubmitting ? "Сохраняем…" : "Изменить пароль"}
      </button>
    </form>
  );
}

function PasswordField({
  autoComplete,
  label,
  name,
}: {
  autoComplete: string;
  label: string;
  name: string;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        className="min-h-12 w-full rounded-md border border-line bg-white px-4 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15"
        name={name}
        required
        type="password"
      />
    </label>
  );
}
