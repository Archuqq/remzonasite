import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";
import type { SiteSettings } from "@/lib/settings";

type FooterProps = {
  settings: SiteSettings;
};

export function Footer({ settings }: FooterProps) {
  const mapUrl = `https://yandex.ru/maps/?oid=${encodeURIComponent(settings.yandexOrgId)}`;

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:py-14">
        <div>
          <Link
            className="font-serif text-2xl font-semibold tracking-[0.12em] text-ink"
            href="/"
          >
            РЕМЗОНА
          </Link>
          <p className="mt-3 text-sm text-muted">Автосервис в Серпухове</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Телефон и часы
          </h2>
          <PhoneLink
            className="mt-3 text-ink"
            phone={settings.phone}
            phoneHref={settings.phoneHref}
          />
          <p className="mt-2 text-sm leading-6 text-muted">
            {settings.hoursWeekdays}
            <br />
            {settings.hoursWeekend}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Адрес
          </h2>
          <a
            className="mt-3 inline-flex min-h-11 items-start gap-2 text-sm leading-6 text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            href={mapUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="mt-1 shrink-0" icon={MapPin} size={17} />
            <span>{settings.address}</span>
          </a>
          <a
            className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            href={mapUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Схема проезда <Icon icon={ArrowUpRight} size={15} />
          </a>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Документы
          </h2>
          <ul className="mt-3 space-y-1">
            {settings.reviewsEnabled ? (
              <li>
                <Link
                  className="inline-flex min-h-11 items-center text-sm text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  href="/#reviews"
                >
                  Отзывы
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                className="inline-flex min-h-11 items-center text-sm text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                href="/privacy"
              >
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex min-h-11 items-center text-sm text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                href="/consent"
              >
                Согласие на обработку персональных данных
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex min-h-14 items-center justify-between gap-4 text-xs text-muted">
          <span>© {new Date().getFullYear()} РЕМЗОНА</span>
          <Link className="hover:text-ink" href="/#top">
            Наверх ↑
          </Link>
        </Container>
      </div>
    </footer>
  );
}
