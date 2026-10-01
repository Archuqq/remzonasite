import { randomUUID } from "node:crypto";
import { z } from "zod";
import { updateJsonFile, readJsonFile, getDataFilePath } from "@/lib/json-store";
import { slugifyTitle } from "@/lib/slug";
import type { ServiceFields } from "@/lib/validation";

export const serviceRecordSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
  duration: z.string(),
  image: z.string(),
  imageAlt: z.string(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const servicesFileSchema = z.array(serviceRecordSchema);
export type ServiceRecord = z.infer<typeof serviceRecordSchema>;

const DEFAULT_SERVICE_FIELDS = [
  {
    slug: "computer-diagnostics",
    category: "ДИАГНОСТИКА",
    title: "Компьютерная диагностика",
    description:
      "Проверка электронных систем автомобиля, чтение ошибок и адаптация.",
    price: "от 1 500 ₽",
    duration: "30–60 мин",
    imageAlt: "Компьютерная диагностика автомобиля",
    sortOrder: 10,
  },
  {
    slug: "scheduled-maintenance",
    category: "ТО",
    title: "Плановое ТО",
    description: "Замена масла, фильтров, проверка основных узлов.",
    price: "от 4 900 ₽",
    duration: "1–3 ч",
    imageAlt: "Плановое техническое обслуживание",
    sortOrder: 20,
  },
  {
    slug: "brake-system",
    category: "ТОРМОЗА",
    title: "Тормозная система",
    description:
      "Диагностика и ремонт тормозной системы, замена колодок и дисков.",
    price: "от 2 500 ₽",
    duration: "1–2 ч",
    imageAlt: "Ремонт тормозной системы",
    sortOrder: 30,
  },
  {
    slug: "suspension",
    category: "ХОДОВАЯ",
    title: "Подвеска",
    description:
      "Диагностика и ремонт амортизаторов, рычагов, сайлентблоков.",
    price: "от 3 200 ₽",
    duration: "1–4 ч",
    imageAlt: "Ремонт подвески",
    sortOrder: 40,
  },
  {
    slug: "air-conditioning",
    category: "КЛИМАТ",
    title: "Кондиционер",
    description:
      "Диагностика, заправка, ремонт и обслуживание системы кондиционирования.",
    price: "от 2 000 ₽",
    duration: "40–90 мин",
    imageAlt: "Обслуживание автомобильного кондиционера",
    sortOrder: 50,
  },
  {
    slug: "body-repair",
    category: "КУЗОВ",
    title: "Кузовной ремонт и покраска",
    description: "Восстановление геометрии, устранение повреждений и покраска.",
    price: "по расчёту",
    duration: "от 1 дня",
    imageAlt: "Кузовной ремонт и покраска",
    sortOrder: 60,
  },
] as const;

export function createDefaultServices(): ServiceRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_SERVICE_FIELDS.map((fields) => ({
    ...fields,
    id: randomUUID(),
    image: "",
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }));
}

export async function getServicesFilePath(): Promise<string> {
  return getDataFilePath("services.json");
}

export async function getAllServices(): Promise<ServiceRecord[]> {
  return readJsonFile(
    await getServicesFilePath(),
    servicesFileSchema,
    createDefaultServices(),
  ).then(sortServices);
}

export async function getServiceById(id: string): Promise<ServiceRecord | null> {
  const services = await getAllServices();
  return services.find((service) => service.id === id) ?? null;
}

function sortServices(services: ServiceRecord[]): ServiceRecord[] {
  return [...services].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder ||
      left.createdAt.localeCompare(right.createdAt),
  );
}

function uniqueSlug(title: string, services: ServiceRecord[]): string {
  const base = slugifyTitle(title);
  const taken = new Set(services.map((service) => service.slug));
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export async function createService(
  fields: ServiceFields,
  image: string,
): Promise<ServiceRecord> {
  const filePath = await getServicesFilePath();
  return updateJsonFile<ServiceRecord[], ServiceRecord>(
    filePath,
    servicesFileSchema,
    createDefaultServices(),
    (services) => {
    const now = new Date().toISOString();
    const service: ServiceRecord = {
      ...fields,
      id: randomUUID(),
      slug: uniqueSlug(fields.title, services),
      image,
      imageAlt: fields.imageAlt || fields.title,
      sortOrder: Math.max(0, ...services.map((item) => item.sortOrder)) + 10,
      isPublished: fields.isPublished,
      createdAt: now,
      updatedAt: now,
    };
    return { data: [...services, service], result: service };
  });
}

export async function updateService(
  id: string,
  fields: ServiceFields,
  newImage: string | null,
): Promise<{ service: ServiceRecord | null; previousImage: string }> {
  const filePath = await getServicesFilePath();
  return updateJsonFile<
    ServiceRecord[],
    { service: ServiceRecord | null; previousImage: string }
  >(filePath, servicesFileSchema, createDefaultServices(), (services) => {
    const existing = services.find((service) => service.id === id);
    if (!existing) {
      return { data: services, result: { service: null, previousImage: "" } };
    }

    const updated: ServiceRecord = {
      ...existing,
      ...fields,
      image: newImage ?? existing.image,
      imageAlt: fields.imageAlt || fields.title,
      updatedAt: new Date().toISOString(),
    };
    return {
      data: services.map((service) => (service.id === id ? updated : service)),
      result: { service: updated, previousImage: existing.image },
    };
  });
}

export async function deleteServiceById(
  id: string,
): Promise<ServiceRecord | null> {
  const filePath = await getServicesFilePath();
  return updateJsonFile(filePath, servicesFileSchema, createDefaultServices(), (services) => {
    const existing = services.find((service) => service.id === id) ?? null;
    return {
      data: existing ? services.filter((service) => service.id !== id) : services,
      result: existing,
    };
  });
}

export async function setServicePublished(
  id: string,
  isPublished: boolean,
): Promise<ServiceRecord | null> {
  const filePath = await getServicesFilePath();
  return updateJsonFile<ServiceRecord[], ServiceRecord | null>(
    filePath,
    servicesFileSchema,
    createDefaultServices(),
    (services) => {
      const existing = services.find((service) => service.id === id) ?? null;
      if (!existing) return { data: services, result: null };

      const updated = {
        ...existing,
        isPublished,
        updatedAt: new Date().toISOString(),
      };
      return {
        data: services.map((service) => (service.id === id ? updated : service)),
        result: updated,
      };
    },
  );
}

export async function reorderServices(
  ids: string[],
): Promise<ServiceRecord[] | null> {
  const filePath = await getServicesFilePath();
  return updateJsonFile(filePath, servicesFileSchema, createDefaultServices(), (services) => {
    const byId = new Map(services.map((service) => [service.id, service]));
    if (
      ids.length !== services.length ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !byId.has(id))
    ) {
      return { data: services, result: null };
    }

    const now = new Date().toISOString();
    const reordered = ids.map((id, index) => ({
      ...byId.get(id)!,
      sortOrder: (index + 1) * 10,
      updatedAt: now,
    }));
    return { data: reordered, result: reordered };
  });
}