import Image from "next/image";
import { Check } from "lucide-react";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { Icon } from "@/components/ui/Icon";

type BrandsSectionProps = {
  phone: string;
  phoneHref: string;
};

const brands = [
  { name: "Toyota", file: "toyota.png" },
  { name: "BMW", file: "bmw.png" },
  { name: "Mercedes-Benz", file: "mercedes.png" },
  { name: "Audi", file: "audi.png" },
  { name: "Volkswagen", file: "vw.png" },
  { name: "Hyundai", file: "hyundai.png" },
  { name: "Kia", file: "kia.png" },
  { name: "Nissan", file: "nissan.png" },
  { name: "Ford", file: "ford.png" },
  { name: "Chevrolet", file: "chevrolet.png" },
  { name: "Renault", file: "renault.png" },
  { name: "Lada", file: "lada.png" },
];

const consultationPoints = [
  "Ответим на вопросы по услугам",
  "Подскажем по срокам",
  "Согласуем стоимость до ремонта",
];

export function BrandsSection({ phone, phoneHref }: BrandsSectionProps) {
  return (
    <section className="border-y border-white/10 bg-site-bg" id="brands">
      <div className="container-site grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
        <div className="lg:pt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-site-accent">
            Обслуживаем любые марки
          </p>
          <h2 className="mt-2 text-xl font-bold text-site-text sm:text-2xl">
            Работаем со всеми марками
          </h2>
          <ul
            aria-label="Марки автомобилей"
            className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4"
          >
            {brands.map((brand) => (
              <li
                className="flex min-h-[76px] items-center justify-center"
                key={brand.name}
              >
                <span className="relative block h-10 w-20 sm:h-12 sm:w-24">
                  <Image
                    alt={brand.name}
                    className="object-contain opacity-90"
                    fill
                    sizes="96px"
                    src={`/logo/${brand.file}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-md border border-white/10 bg-surface p-5 sm:p-7 lg:min-h-[360px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-site-accent">
              Быстро и удобно
            </p>
            <h2 className="mt-2 text-xl font-bold text-site-text sm:text-2xl">
              Нужна консультация?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-site-muted">
              Позвоните — ответим на вопросы по услуге и подскажем, с чего начать.
            </p>
          </div>
          <ul className="grid gap-3 border-t border-white/10 pt-5 text-sm text-site-text sm:grid-cols-2 lg:grid-cols-1">
            {consultationPoints.map((point) => (
              <li className="flex items-start gap-2.5" key={point}>
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-site-accent"
                  icon={Check}
                  size={16}
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <PhoneLink
            className="min-h-12 w-full px-4"
            phone={phone}
            phoneHref={phoneHref}
            variant="accent"
          >
            Позвонить
          </PhoneLink>
        </div>
      </div>
    </section>
  );
}