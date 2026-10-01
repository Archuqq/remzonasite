import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getServiceImageUrls } from "@/lib/images";
import { getAllServices, type ServiceRecord } from "@/lib/service-store";

export const SERVICES_CACHE_TAG = "services";

export type AdminServiceDto = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  imageAlt: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrls: { src1200: string; src600: string };
  hasImage: boolean;
};

export function serializeService(service: ServiceRecord): AdminServiceDto {
  return {
    ...service,
    imageUrls: getServiceImageUrls(service.image),
    hasImage: Boolean(service.image),
  };
}

export function revalidatePublicServices(): void {
  revalidatePath("/");
  revalidateTag(SERVICES_CACHE_TAG, "max");
}

export type PublicService = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  imageAlt: string;
  imageUrls: { src1200: string; src600: string };
};

async function loadPublishedServices(): Promise<PublicService[]> {
  const services = await getAllServices();
  return services
    .filter((service) => service.isPublished)
    .map((service) => ({
      id: service.id,
      slug: service.slug,
      category: service.category,
      title: service.title,
      description: service.description,
      price: service.price,
      duration: service.duration,
      imageAlt: service.image
        ? service.imageAlt || service.title
        : "Услуга автосервиса РЕМЗОНА",
      imageUrls: getServiceImageUrls(service.image),
    }));
}

/** Опубликованные услуги для главной. Кэш с тегом `services`. */
export const getPublishedServices = unstable_cache(
  loadPublishedServices,
  ["published-services-json"],
  { tags: [SERVICES_CACHE_TAG] },
);
