import { SERVICE_IMAGE_PLACEHOLDER_URL } from "@/lib/image-constants";
import {
  Disc3,
  Paintbrush,
  ScanSearch,
  Settings2,
  Snowflake,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export type ServiceCardProps = {
  category: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  imageAlt: string;
  imageUrls: { src600: string; src1200: string };
  phone?: string;
  phoneHref?: string;
  /** Предпросмотр в админке: кнопка «Позвонить» не ссылка. */
  preview?: boolean;
};

const imageSizes =
  "(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw";

function serviceIcon(category: string, title: string): LucideIcon {
  const label = `${category} ${title}`.toLocaleLowerCase("ru");
  if (label.includes("диагност")) return ScanSearch;
  if (label.includes("тормоз")) return Disc3;
  if (label.includes("подвес")) return Settings2;
  if (label.includes("климат") || label.includes("кондиционер")) {
    return Snowflake;
  }
  if (label.includes("кузов") || label.includes("покрас")) return Paintbrush;
  if (label.includes("то") || label.includes("обслуж")) return Wrench;
  return Wrench;
}

export function ServiceCard({
  category,
  title,
  description,
  price,
  duration,
  imageAlt,
  imageUrls,
  phone = "",
  phoneHref = "tel:+79000000000",
  preview = false,
}: ServiceCardProps) {
  const src600 = imageUrls.src600 || SERVICE_IMAGE_PLACEHOLDER_URL;
  const src1200 = imageUrls.src1200 || SERVICE_IMAGE_PLACEHOLDER_URL;
  const srcSet =
    src600 === src1200 ? undefined : `${src600} 600w, ${src1200} 1200w`;
  const hasImage = src1200 !== SERVICE_IMAGE_PLACEHOLDER_URL;

  return (
    <article className="group flex h-full w-full gap-3 rounded-md border border-line bg-surface p-3 transition duration-200 hover:border-site-accent/50 hover:bg-[#141b20] sm:gap-4 sm:p-4">
      <div className="relative size-[92px] shrink-0 overflow-hidden rounded-md bg-section-alt sm:size-32">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- /uploads и blob-предпросмотр
          <img
            alt={imageAlt || title}
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.06]"
            decoding="async"
            height={600}
            loading="lazy"
            sizes={srcSet ? imageSizes : undefined}
            src={src1200}
            srcSet={srcSet}
            width={1200}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Icon
              aria-hidden="true"
              className="text-site-accent"
              icon={serviceIcon(category, title)}
              size={35}
              strokeWidth={1.4}
            />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-site-accent">
          {category || "Категория"}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-tight text-site-text sm:text-base">
          {title || "Название"}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-4 text-site-muted sm:text-xs">
          {description || "Описание услуги"}
        </p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <div className="min-w-0">
            <span className="block text-sm font-extrabold text-site-accent sm:text-base">
              {price || "Цена"}
            </span>
            <span className="mt-0.5 block text-[10px] text-site-muted">
              {duration || "Срок"}
            </span>
          </div>
          {preview ? (
            <span
              aria-hidden="true"
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-site-accent px-3 text-sm font-semibold text-white"
            >
              Записаться
            </span>
          ) : (
            <a
              aria-label={`Записаться на услугу «${title}» по телефону ${phone}`}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-site-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-site-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
              href={phoneHref}
            >
              Записаться
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
