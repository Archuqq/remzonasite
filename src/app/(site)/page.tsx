import { getSettings } from "@/lib/settings";
import { getPublishedServices } from "@/lib/services";
import { Hero } from "@/components/site/Hero";
import { ServicesSection } from "@/components/site/ServicesSection";
import { ProcessSection } from "@/components/site/ProcessSection";
import { AdvantagesSection } from "@/components/site/AdvantagesSection";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { MapSection } from "@/components/site/MapSection";
import { FinalCta } from "@/components/site/FinalCta";
import { LocalBusinessSchema } from "@/components/site/LocalBusinessSchema";
import { GuaranteesSection } from "@/components/site/GuaranteesSection";

export default async function HomePage() {
  const [settings, services] = await Promise.all([
    getSettings(),
    getPublishedServices(),
  ]);

  return (
    <main>
      <LocalBusinessSchema settings={settings} />
      <Hero phone={settings.phone} phoneHref={settings.phoneHref} />
      <ServicesSection
        phone={settings.phone}
        phoneHref={settings.phoneHref}
        services={services}
      />
      <GuaranteesSection />
      <ProcessSection />
      <AdvantagesSection />
      <ReviewsSection
        enabled={settings.reviewsEnabled}
        yandexOrgId={settings.yandexOrgId}
      />
      <MapSection settings={settings} />
      <FinalCta phone={settings.phone} phoneHref={settings.phoneHref} />
    </main>
  );
}
