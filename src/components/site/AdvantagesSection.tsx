import { advantages } from "@/content/advantages";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

export function AdvantagesSection() {
  return (
    <Section
      className="bg-bg"
      description="Профессиональный подход к каждому автомобилю."
      id="about"
      title="Наши преимущества"
    >
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {advantages.map((advantage) => (
          <li key={advantage.title}>
            <Reveal className="h-full">
              <div className="flex h-full flex-col rounded-lg border border-line bg-surface p-6">
                <span className="flex size-12 items-center justify-center rounded-full border border-line bg-surface text-ink">
                  <Icon icon={advantage.icon} size={22} />
                </span>
                <h3 className="mt-6 font-serif text-2xl font-medium text-ink">
                  {advantage.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
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