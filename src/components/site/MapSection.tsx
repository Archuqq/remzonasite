import { ArrowUpRight, MapPin } from "lucide-react";
import { MapEmbed } from "@/components/site/MapEmbed";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { YANDEX_MAP_CONSTRUCTOR_URL } from "@/lib/map";
import type { SiteSettings } from "@/lib/settings";

type MapSectionProps = {
  settings: SiteSettings;
};

export function MapSection({ settings }: MapSectionProps) {
  const mapSearchUrl = `https://yandex.ru/maps/?mode=search&text=${encodeURIComponent(settings.address)}`;

  return (
    <section className="bg-bg" id="contacts">
      <div className="container-site py-20 sm:py-24">
        <div className="relative flex flex-col">
          <MapEmbed
            fallbackUrl={mapSearchUrl}
            mapUrl={YANDEX_MAP_CONSTRUCTOR_URL}
          />
          <aside className="order-first z-10 -mb-8 mx-4 rounded-lg border border-line bg-surface p-6 shadow-[0_12px_32px_rgba(21,25,28,0.08)] sm:mx-8 sm:p-8 lg:absolute lg:left-8 lg:top-8 lg:order-none lg:mb-0 lg:w-[340px] xl:left-12">
            <h2 className="font-serif text-3xl font-medium text-ink">
              Наш сервис на карте
            </h2>
            <a
              className="mt-5 flex min-h-11 items-start gap-2 text-sm leading-6 text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              href={mapSearchUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon className="mt-1 shrink-0" icon={MapPin} size={18} />
              <span>{settings.address}</span>
            </a>
            <PhoneLink
              className="mt-2 text-ink"
              phone={settings.phone}
              phoneHref={settings.phoneHref}
            />
            <p className="mt-4 text-sm leading-6 text-muted">
              {settings.hoursWeekdays}
              <br />
              {settings.hoursWeekend}
            </p>
            <a
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              href={mapSearchUrl}
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