import { PhoneLink } from "@/components/ui/PhoneLink";
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
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(21,25,28,0.08)]">
      <div className="relative aspect-[3/2] overflow-hidden rounded-t-lg bg-section-alt">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- /uploads и blob-предпросмотр
          <img
            alt={imageAlt || title}
            className="h-full w-full object-cover object-center transition duration-200 group-hover:scale-[1.02]"
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
            <Icon aria-hidden="true" icon={serviceIcon(category, title)} size={54} strokeWidth={1.3} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {category || "Категория"}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-medium text-ink">
          {title || "Название"}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">
          {description || "Описание услуги"}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted">
          <span>{price || "Цена"}</span>
          <span>{duration || "Срок"}</span>
        </div>
        <PhoneLink
          className="mt-5 w-fit group-hover:bg-dark"
          phone={phone}
          phoneHref={phoneHref}
          preview={preview}
          variant="primary"
        >
          Позвонить
        </PhoneLink>
      </div>
    </article>
  );
}
