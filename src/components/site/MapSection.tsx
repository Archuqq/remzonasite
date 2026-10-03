import { ArrowUpRight, MapPin } from "lucide-react";
import { MapEmbed } from "@/components/site/MapEmbed";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";
import {
  YANDEX_MAP_CONSTRUCTOR_URL,
  YANDEX_MAP_LOCATION_URL,
} from "@/lib/map";
import type { SiteSettings } from "@/lib/settings";

type MapSectionProps = {
  settings: SiteSettings;
};

export function MapSection({ settings }: MapSectionProps) {
  return (
    <section className="bg-site-bg" id="contacts">
      <div className="container-site py-12 sm:py-16">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-site-accent">
            Контакты
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-site-text sm:text-4xl">
            Приезжайте в ДИЗЕЛЬ СЕРВИС
          </h2>
        </header>
        <div className="relative flex flex-col">
          <MapEmbed
            fallbackUrl={YANDEX_MAP_LOCATION_URL}
            mapUrl={YANDEX_MAP_CONSTRUCTOR_URL}
          />
          <aside className="order-first z-10 -mb-8 mx-4 rounded-md border border-white/10 bg-surface p-5 sm:mx-8 sm:p-7 lg:absolute lg:left-8 lg:top-8 lg:order-none lg:mb-0 lg:w-[340px] xl:left-12">
            <a
              className="flex min-h-11 items-start gap-2 text-sm leading-6 text-site-text hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
              href={YANDEX_MAP_LOCATION_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon className="mt-1 shrink-0" icon={MapPin} size={18} />
              <span>{settings.address}</span>
            </a>
            <PhoneLink
              className="mt-2 text-site-text"
              phone={settings.phone}
              phoneHref={settings.phoneHref}
            />
            <p className="mt-3 text-sm leading-6 text-site-muted">
              {settings.hoursWeekdays}
              {settings.hoursWeekend ? (
                <>
                  <br />
                  {settings.hoursWeekend}
                </>
              ) : null}
            </p>
            <a
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-site-accent bg-site-accent px-4 text-sm font-bold text-white transition-colors hover:bg-transparent hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
              href={YANDEX_MAP_LOCATION_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Построить маршрут <Icon icon={ArrowUpRight} size={16} />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}