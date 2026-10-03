import Link from "next/link";
import { ArrowUpRight, Cog, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { YANDEX_MAP_LOCATION_URL } from "@/lib/map";
import type { SiteSettings } from "@/lib/settings";

type FooterProps = {
  settings: SiteSettings;
};

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-site-bg text-site-text">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1.3fr] lg:gap-8 lg:py-12">
        <div>
          <Link
            className="flex w-fit items-center gap-2 text-xl font-extrabold tracking-[-0.04em] text-site-text"
            href="/"
          >
            <Icon className="text-site-accent" icon={Cog} size={27} strokeWidth={2.5} />
            <span>РЕМ<span className="text-site-accent">ЗОНА</span></span>
          </Link>
          <p className="mt-3 text-sm text-site-muted">Автосервис в Серпухове</p>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-site-accent">
            Телефон и часы
          </h2>
          <PhoneLink
            className="mt-3 text-site-text"
            phone={settings.phone}
            phoneHref={settings.phoneHref}
          />
          <p className="mt-2 text-sm leading-6 text-site-muted">
            {settings.hoursWeekdays}
            {settings.hoursWeekend ? (
              <>
                <br />
                {settings.hoursWeekend}
              </>
            ) : null}
          </p>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-site-accent">
            Адрес
          </h2>
          <a
            className="mt-3 inline-flex min-h-11 items-start gap-2 text-sm leading-6 text-site-text hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
            href={YANDEX_MAP_LOCATION_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="mt-1 shrink-0" icon={MapPin} size={17} />
            <span>{settings.address}</span>
          </a>
          <a
            className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-site-text hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
            href={YANDEX_MAP_LOCATION_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Схема проезда <Icon icon={ArrowUpRight} size={15} />
          </a>
        </div>

        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-site-accent">
            Навигация
          </h2>
          <ul className="mt-3 space-y-1">
            {[
              ["Услуги", "/#services"],
              ["Цены", "/#services"],
              ["О нас", "/#about"],
              ["Акции", "/#promo"],
              ["Контакты", "/#contacts"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link
                  className="inline-flex min-h-9 items-center text-sm text-site-muted transition-colors hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
                  href={href}
                >
                  {label}
                </Link>
              </li>
            ))}
            {settings.reviewsEnabled ? (
              <li>
                <Link
                  className="inline-flex min-h-9 items-center text-sm text-site-muted transition-colors hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
                  href="/#reviews"
                >
                  Отзывы
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex min-h-14 items-center justify-between gap-4 text-xs text-site-muted">
          <span>© {new Date().getFullYear()} РЕМЗОНА</span>
          <Link className="hover:text-site-accent" href="/#top">
            Наверх ↑
          </Link>
        </Container>
      </div>
    </footer>
  );
}
