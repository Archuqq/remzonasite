"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminServiceDto } from "@/lib/services";

type ServicesListProps = {
  services: AdminServiceDto[];
};

export function ServicesList({ services }: ServicesListProps) {
  const router = useRouter();
  const [items, setItems] = useState(services);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminServiceDto | null>(
    null,
  );

  async function runAction(id: string, action: () => Promise<void>) {
    if (busyId) return;
    setBusyId(id);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Не удалось выполнить действие.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function parseError(response: Response, fallback: string) {
    const result = (await response.json()) as { error?: string };
    throw new Error(result.error ?? fallback);
  }

  async function togglePublished(service: AdminServiceDto) {
    await runAction(service.id, async () => {
      const response = await fetch(
        `/api/admin/services/${service.id}/publish`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !service.isPublished }),
        },
      );
      if (!response.ok)
        await parseError(response, "Не удалось изменить статус.");
      setItems((current) =>
        current.map((item) =>
          item.id === service.id
            ? { ...item, isPublished: !item.isPublished }
            : item,
        ),
      );
    });
  }

  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    const previous = items;
    setItems(next);

    await runAction(moved.id, async () => {
      const response = await fetch("/api/admin/services/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((item) => item.id) }),
      });
      if (!response.ok) {
        setItems(previous);
        await parseError(response, "Не удалось изменить порядок.");
      }
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const service = pendingDelete;
    await runAction(service.id, async () => {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        await parseError(response, "Не удалось удалить услугу.");
      setItems((current) => current.filter((item) => item.id !== service.id));
      setPendingDelete(null);
    });
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-base text-muted">
        Карточек пока нет.{" "}
        <Link className="underline" href="/admin/services/new">
          Создайте первую услугу
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {error ? (
        <p
          className="rounded-md border border-line bg-section-alt px-4 py-3 text-sm text-ink"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <ul className="space-y-4">
        {items.map((service, index) => (
          <li
            className="grid gap-4 rounded-lg border border-line bg-surface p-4 md:grid-cols-[160px_minmax(0,1fr)_auto]"
            key={service.id}
          >
            <div className="aspect-[2/1] overflow-hidden rounded-md bg-section-alt">
              {/* eslint-disable-next-line @next/next/no-img-element -- миниатюра /uploads или заглушка */}
              <img
                alt={service.imageAlt || service.title}
                className="h-full w-full object-cover object-center"
                src={service.imageUrls.src600}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {service.category}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-ink">
                {service.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{service.price}</p>
              <p className="mt-2 text-sm text-ink">
                {service.isPublished ? "Опубликовано" : "Скрыто"}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-stretch">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-medium text-ink"
                href={`/admin/services/${service.id}`}
              >
                Изменить
              </Link>
              <button
                className="min-h-11 rounded-md border border-line px-4 text-sm font-medium text-ink disabled:opacity-50"
                disabled={busyId === service.id}
                onClick={() => void togglePublished(service)}
                type="button"
              >
                {service.isPublished ? "Скрыть" : "Показать"}
              </button>
              <button
                className="min-h-11 rounded-md border border-line px-4 text-sm font-medium text-ink disabled:opacity-50"
                disabled={busyId === service.id}
                onClick={() => setPendingDelete(service)}
                type="button"
              >
                Удалить
              </button>
              <div className="flex gap-2">
                <button
                  aria-label="Переместить выше"
                  className="min-h-11 min-w-11 rounded-md border border-line text-sm font-medium text-ink disabled:opacity-40"
                  disabled={index === 0 || Boolean(busyId)}
                  onClick={() => void move(index, -1)}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label="Переместить ниже"
                  className="min-h-11 min-w-11 rounded-md border border-line text-sm font-medium text-ink disabled:opacity-40"
                  disabled={index === items.length - 1 || Boolean(busyId)}
                  onClick={() => void move(index, 1)}
                  type="button"
                >
                  ↓
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete ? (
        <div
          aria-labelledby="delete-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-ink" id="delete-title">
              Удалить услугу?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Карточка «{pendingDelete.title}» будет удалена вместе с фото. Это
              действие нельзя отменить.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="min-h-11 rounded-md bg-ink px-5 text-sm font-semibold text-white disabled:opacity-60"
                disabled={busyId === pendingDelete.id}
                onClick={() => void confirmDelete()}
                type="button"
              >
                {busyId === pendingDelete.id ? "Удаляем…" : "Удалить"}
              </button>
              <button
                className="min-h-11 rounded-md border border-line px-5 text-sm font-semibold text-ink"
                onClick={() => setPendingDelete(null)}
                type="button"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
