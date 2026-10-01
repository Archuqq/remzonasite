import type { SiteSettings } from "@/lib/settings";
import { env } from "@/lib/env";

type LocalBusinessSchemaProps = {
  settings: SiteSettings;
};

function parseHours(value: string): { opens: string; closes: string } {
  const match = value.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  return {
    opens: match?.[1] ?? "09:00",
    closes: match?.[2] ?? "20:00",
  };
}

export function LocalBusinessSchema({
  settings,
}: LocalBusinessSchemaProps) {
  const weekdays = parseHours(settings.hoursWeekdays);
  const weekend = parseHours(settings.hoursWeekend);
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: settings.siteName,
    url: env.SITE_URL,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Серпухов",
      streetAddress: settings.address,
      addressCountry: "RU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: weekdays.opens,
        closes: weekdays.closes,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: weekend.opens,
        closes: weekend.closes,
      },
    ],
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      type="application/ld+json"
    />
  );
}