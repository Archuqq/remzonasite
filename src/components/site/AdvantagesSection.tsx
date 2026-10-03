import { advantages } from "@/content/advantages";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

export function AdvantagesSection() {
  return (
    <Section
      className="bg-site-bg !py-12 sm:!py-16"
      description="Оборудование, опыт мастеров и понятная стоимость ремонта."
      title="Профессиональный подход"
    >
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {advantages.map((advantage) => (
          <li key={advantage.title}>
            <Reveal className="h-full">
              <div className="flex h-full flex-col rounded-md border border-white/10 bg-surface p-5">
                <span className="flex size-10 items-center justify-center rounded-md border border-site-accent/40 text-site-accent">
                  <Icon icon={advantage.icon} size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-site-text">
                  {advantage.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-site-muted">
                  {advantage.description}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}