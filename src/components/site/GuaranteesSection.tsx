import { BadgeCheck, ClipboardCheck, Factory } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

const guarantees = [
  {
    icon: BadgeCheck,
    headline: "12 месяцев",
    title: "Гарантия на работы",
    description: "Срок гарантии на выполненные работы — 12 месяцев.",
  },
  {
    icon: Factory,
    headline: "По производителю",
    title: "Гарантия на запчасти",
    description: "Действуют условия и сроки гарантии производителя детали.",
  },
  {
    icon: ClipboardCheck,
    headline: "До начала работ",
    title: "Согласуем стоимость",
    description: "Называем цену заранее — без сюрпризов в чеке.",
  },
];

export function GuaranteesSection() {
  return (
    <Section
      className="bg-section-alt !py-14 sm:!py-16"
      eyebrow="Понятные условия"
      title="Гарантии и стоимость"
    >
      <ul className="grid gap-3 md:grid-cols-3">
        {guarantees.map((guarantee) => (
          <li
            className="rounded-md border border-line bg-surface p-5 sm:p-6"
            key={guarantee.title}
          >
            <Icon
              aria-hidden="true"
              className="text-signal"
              icon={guarantee.icon}
              size={23}
              strokeWidth={1.6}
            />
            <p className="mt-4 font-serif text-2xl font-medium text-ink">
              {guarantee.headline}
            </p>
            <h3 className="mt-2 text-sm font-semibold text-ink">
              {guarantee.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {guarantee.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}