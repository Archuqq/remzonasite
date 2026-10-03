import Image from "next/image";
import { PhoneLink } from "@/components/ui/PhoneLink";

type FinalCtaProps = {
  phone: string;
  phoneHref: string;
};

export function FinalCta({ phone, phoneHref }: FinalCtaProps) {
  return (
    <section className="relative isolate overflow-hidden bg-site-bg" id="call">
      <Image
        alt=""
        className="object-cover object-[62%_center] opacity-35"
        fill
        sizes="100vw"
        src="/images/back_bmw.png"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-site-bg/65" />
      <div className="container-site relative grid min-h-[300px] gap-6 py-12 sm:py-16 lg:min-h-[360px] lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-site-accent">
            РЕМЗОНА · СЕРПУХОВ
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-site-text sm:text-4xl lg:text-5xl">
            Автомобиль требует внимания?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-site-muted sm:text-base">
            Позвоните — разберёмся с причиной и предложим варианты ремонта.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <PhoneLink
            className="min-h-12 px-5"
            phone={phone}
            phoneHref={phoneHref}
            variant="accent"
          >
            Позвонить
          </PhoneLink>
          <a
            className="text-sm font-bold text-site-text underline decoration-site-accent underline-offset-4"
            href={phoneHref}
          >
            {phone}
          </a>
        </div>
      </div>
    </section>
  );
}