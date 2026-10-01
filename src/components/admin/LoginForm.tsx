"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
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
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: formData.get("login"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Не удалось войти.");
        return;
      }

      router.replace("/admin/services");
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером. Повторите попытку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Логин</span>
        <input
          autoComplete="username"
          className="min-h-12 w-full rounded-md border border-line bg-white px-4 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15"
          name="login"
          required
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Пароль</span>
        <input
          autoComplete="current-password"
          className="min-h-12 w-full rounded-md border border-line bg-white px-4 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15"
          name="password"
          required
          type="password"
        />
      </label>
      {error ? (
        <p
          className="rounded-md border border-line bg-section-alt px-4 py-3 text-sm text-ink"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        className="min-h-12 w-full rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
