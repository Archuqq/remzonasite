"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ServiceCard } from "@/components/site/ServiceCard";
import { SERVICE_IMAGE_MAX_BYTES } from "@/lib/image-constants";
import type { AdminServiceDto } from "@/lib/services";
import { serviceFieldLimits } from "@/lib/validation";

type ServiceFormProps = {
  mode: "create" | "edit";
  service?: AdminServiceDto;
};

type FieldErrors = Partial<
  Record<
    | "category"
    | "title"
    | "description"
    | "price"
    | "duration"
    | "imageAlt"
    | "image"
    | "form",
    string
  >
>;

const inputClassName =
  "min-h-12 w-full rounded-md border border-line bg-white px-4 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15";

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(service?.category ?? "");
  const [title, setTitle] = useState(service?.title ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(service?.price ?? "");
  const [duration, setDuration] = useState(service?.duration ?? "");
  const [imageAlt, setImageAlt] = useState(service?.imageAlt ?? "");
  const [isPublished, setIsPublished] = useState(service?.isPublished ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return service?.imageUrls.src1200 ?? null;
  }, [file, service?.imageUrls.src1200]);

  useEffect(() => {
    if (!file) return;
    const url = previewUrl;
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [file, previewUrl]);

  const hasPhoto = Boolean(file || service?.hasImage);
  const showPlaceholderNotice = !hasPhoto;

  function applyFile(nextFile: File | null) {
    setErrors((current) => ({ ...current, image: undefined }));
    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > SERVICE_IMAGE_MAX_BYTES) {
      setFile(null);
      setErrors({
        image: "Размер изображения не должен превышать 10 МБ.",
      });
      return;
    }

    if (nextFile.type && !nextFile.type.startsWith("image/")) {
      setFile(null);
      setErrors({ image: "Выберите файл изображения." });
      return;
    }

    setFile(nextFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.set("category", category);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("price", price);
    formData.set("duration", duration);
    formData.set("imageAlt", imageAlt);
    formData.set("isPublished", isPublished ? "true" : "false");
    if (file) formData.set("image", file);

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/services"
          : `/api/admin/services/${service?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          body: formData,
        },
      );
      const result = (await response.json()) as {
        error?: string;
        fields?: FieldErrors;
      };

      if (!response.ok) {
        setErrors({
          form: result.error ?? "Не удалось сохранить услугу.",
          ...result.fields,
        });
        return;
      }

      router.replace("/admin/services?saved=1");
      router.refresh();
    } catch {
      setErrors({ form: "Не удалось связаться с сервером. Повторите попытку." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <Field
          error={errors.category}
          label="Категория"
          maxLength={serviceFieldLimits.category}
          onChange={setCategory}
          value={category}
        />
        <Field
          error={errors.title}
          label="Название"
          maxLength={serviceFieldLimits.title}
          onChange={setTitle}
          value={title}
        />
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Описание</span>
          <textarea
            className={`${inputClassName} min-h-32 py-3`}
            maxLength={serviceFieldLimits.description}
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
          {errors.description ? (
            <span className="block text-sm font-normal text-ink" role="alert">
              {errors.description}
            </span>
          ) : null}
        </label>
        <Field
          error={errors.price}
          label="Цена"
          maxLength={serviceFieldLimits.price}
          onChange={setPrice}
          value={price}
        />
        <Field
          error={errors.duration}
          label="Длительность"
          maxLength={serviceFieldLimits.duration}
          onChange={setDuration}
          value={duration}
        />
        <Field
          error={errors.imageAlt}
          label="Подпись к фото"
          maxLength={serviceFieldLimits.imageAlt}
          onChange={setImageAlt}
          value={imageAlt}
        />
        <label className="flex min-h-12 items-center gap-3 text-sm font-medium text-ink">
          <input
            checked={isPublished}
            className="size-4 accent-ink"
            onChange={(event) => setIsPublished(event.target.checked)}
            type="checkbox"
          />
          Опубликовать на сайте
        </label>

        <div
          className={`rounded-lg border border-dashed p-6 ${
            isDragging ? "border-ink bg-section-alt" : "border-line bg-surface"
          }`}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            applyFile(event.dataTransfer.files[0] ?? null);
          }}
        >
          <p className="text-sm font-medium text-ink">Фото карточки</p>
          <p className="mt-2 text-sm text-muted">
            Необязательно. Любое фото будет обрезано по центру до формата 2:1.
            Можно выбрать файл или перетащить его сюда.
          </p>
          <input
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="mt-4 block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          {errors.image ? (
            <p className="mt-3 text-sm text-ink" role="alert">
              {errors.image}
            </p>
          ) : null}
          {showPlaceholderNotice ? (
            <p className="mt-3 text-sm text-muted">
              Фото не выбрано — будет показана заглушка.
            </p>
          ) : null}
        </div>

        {errors.form ? (
          <p
            className="rounded-md border border-line bg-section-alt px-4 py-3 text-sm text-ink"
            role="alert"
          >
            {errors.form}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            className="min-h-12 rounded-md bg-ink px-6 text-sm font-semibold text-white transition hover:bg-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Сохраняем…" : "Сохранить"}
          </button>
          <Link
            className="inline-flex min-h-12 items-center rounded-md border border-line px-6 text-sm font-semibold text-ink"
            href="/admin/services"
          >
            Отмена
          </Link>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-ink">Предпросмотр карточки</p>
        <ServiceCard
          category={category}
          description={description}
          duration={duration}
          imageAlt={imageAlt || title}
          imageUrls={{
            src600: previewUrl || "",
            src1200: previewUrl || "",
          }}
          preview
          price={price}
          title={title}
        />
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  maxLength,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        className={inputClassName}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      {error ? (
        <span className="block text-sm font-normal text-ink" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
