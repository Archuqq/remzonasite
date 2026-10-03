import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/site/ServiceCard";
import type { PublicService } from "@/lib/services";

type ServicesSectionProps = {
  services: PublicService[];
  phone: string;
  phoneHref: string;
};

export function ServicesSection({
  services,
  phone,
  phoneHref,
}: ServicesSectionProps) {
  return (
    <Section
      className="bg-site-bg !pt-7 !pb-10 sm:!pt-10 sm:!pb-14"
      eyebrow="Наши услуги"
      eyebrowClassName="text-site-accent"
      id="services"
      title="Чем можем помочь?"
    >
      {services.length === 0 ? (
        <p className="text-base text-muted">
          Сейчас нет опубликованных услуг. Позвоните, чтобы уточнить наличие.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <li className="flex h-full" key={service.id}>
              <Reveal style={{ transitionDelay: `${Math.min(index, 5) * 60}ms` }}>
                <ServiceCard
                  category={service.category}
                  description={service.description}
                  duration={service.duration}
                  imageAlt={service.imageAlt}
                  imageUrls={service.imageUrls}
                  phone={phone}
                  phoneHref={phoneHref}
                  price={service.price}
                  title={service.title}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
