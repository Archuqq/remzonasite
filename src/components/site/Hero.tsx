import { preload } from "react-dom";
import { Award, Gauge, ShieldCheck } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { HERO_BLUR_DATA_URL } from "@/lib/hero-blur";

type HeroProps = {
  phone: string;
  phoneHref: string;
};

const imageWidths = [640, 1024, 1600, 1920] as const;
const avifSrcSet = imageWidths
  .map((width) => `/images/hero-${width}.avif ${width}w`)
  .join(", ");
const webpSrcSet = imageWidths
  .map((width) => `/images/hero-${width}.webp ${width}w`)
  .join(", ");
const imageSizes = "100vw";

const advantages = [
  { icon: Gauge, label: "Официальное оборудование" },
  { icon: Award, label: "Опытные мастера с сертификатами" },
  { icon: ShieldCheck, label: "Гарантия на все работы" },
];

export function Hero({ phone, phoneHref }: HeroProps) {
  preload("/images/hero-1600.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: avifSrcSet,
    imageSizes,
    fetchPriority: "high",
  });

  return (
    <section className="relative isolate overflow-hidden bg-bg">
      <div className="container-site relative z-10 grid grid-cols-1 items-center gap-0 pt-8 pb-[calc(37vw+0.5rem)] sm:pb-[calc(45.45vw+1rem)] md:min-h-[570px] md:py-10 xl:min-h-[620px] xl:py-12">
        <div className="max-w-[560px] md:w-[53%] xl:w-[48%]">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink sm:text-xs">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Автосервис в Серпухове
          </p>
          <h1 className="mt-4 max-w-[560px] font-serif text-[40px] font-medium leading-[0.98] text-ink sm:mt-6 sm:text-[48px] md:text-[46px] lg:text-[58px] 2xl:text-[66px]">
            Сервис, которому
            <br />
            можно доверить
            <br />
            автомобиль
          </h1>
          <p className="mt-4 max-w-[500px] text-base leading-7 text-muted sm:mt-6 sm:text-[17px]">
            Диагностика, плановое ТО и ремонт любых иномарок и отечественных
            авто. Называем цену до начала работ — без сюрпризов в чеке.
          </p>
          <div className="mt-6 flex flex-row flex-wrap gap-2 sm:mt-8 sm:gap-3">
            <PhoneLink
              className="w-auto flex-1 sm:flex-none"
              phone={phone}
              phoneHref={phoneHref}
              variant="primary"
            >
              Позвонить
            </PhoneLink>
            <a
              className="inline-flex min-h-12 w-auto flex-1 items-center justify-center rounded-md border border-ink bg-transparent px-4 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:flex-none sm:px-5"
              href="#services"
            >
              Наши услуги
            </a>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-4 sm:mt-9 sm:gap-3 sm:pt-6 xl:grid-cols-1 xl:gap-2">
            {advantages.map(({ icon, label }) => (
              <li
                className="flex items-center gap-2 text-xs leading-4 text-ink sm:gap-3 sm:text-sm sm:leading-5"
                key={label}
              >
                <Icon className="shrink-0 text-muted" icon={icon} size={17} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 aspect-[2.2/1] overflow-hidden bg-section-alt md:inset-y-0 md:left-[45%] md:right-0 md:aspect-auto"
        style={{
          backgroundImage: `url(${HERO_BLUR_DATA_URL})`,
          backgroundSize: "cover",
        }}
      >
        <picture className="absolute inset-0 block h-full w-full">
          <source type="image/avif" srcSet={avifSrcSet} sizes={imageSizes} />
          <source type="image/webp" srcSet={webpSrcSet} sizes={imageSizes} />
          <img
            alt="Mercedes в автосервисе РЕМЗОНА"
            className="h-full w-full object-cover object-[48%_center]"
            decoding="async"
            fetchPriority="high"
            height={1081}
            loading="eager"
            src="/images/hero-1600.webp"
            srcSet={webpSrcSet}
            sizes={imageSizes}
            width={1920}
          />
        </picture>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[24%] bg-[linear-gradient(90deg,#F7F7F5_0%,rgba(247,247,245,0.86)_24%,rgba(247,247,245,0.48)_50%,rgba(247,247,245,0.12)_76%,transparent_100%)] md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg/20 to-transparent md:hidden"
        />
      </div>
    </section>
  );
}
