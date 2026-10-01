import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";

type FinalCtaProps = {
  phone: string;
  phoneHref: string;
};

const imageSrcSet =
  "/images/hero-640.webp 640w, /images/hero-1024.webp 1024w, /images/hero-1600.webp 1600w";

export function FinalCta({ phone, phoneHref }: FinalCtaProps) {
  return (
    <section className="overflow-hidden bg-dark text-white">
      <div className="container-site grid min-h-[420px] items-stretch gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-0">
        <div className="flex flex-col justify-center lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            РЕМЗОНА
          </p>
          <h2 className="mt-5 max-w-xl font-serif text-4xl font-medium leading-[1.02] sm:text-5xl">
            Позвоните нам уже сегодня
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Позвоните — мы ответим на вопросы и подберём удобное время визита.
          </p>
          <PhoneLink
            className="mt-8 w-fit"
            phone={phone}
            phoneHref={phoneHref}
            variant="light"
          >
            Позвонить <Icon icon={ArrowRight} size={16} />
          </PhoneLink>
        </div>
        <div className="relative min-h-[240px] overflow-hidden lg:min-h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- responsive local hero crop */}
          <img
            alt="Автомобиль в сервисе РЕМЗОНА"
            className="h-full w-full object-cover object-[62%_center] opacity-55"
            decoding="async"
            height={901}
            loading="lazy"
            sizes="(min-width: 1024px) 55vw, 100vw"
            src="/images/hero-1024.webp"
            srcSet={imageSrcSet}
            width={1600}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-dark/35" />
        </div>
      </div>
    </section>
  );
}