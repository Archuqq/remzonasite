import { Activity, CircleAlert, Disc3 } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";

type WhyNowSectionProps = {
  phone: string;
  phoneHref: string;
};

const symptoms = [
  { icon: CircleAlert, question: "Загорелся Check Engine?" },
  { icon: Activity, question: "Появился стук или вибрация?" },
  { icon: Disc3, question: "Автомобиль стал хуже тормозить?" },
];

export function WhyNowSection({ phone, phoneHref }: WhyNowSectionProps) {
  return (
    <section className="bg-site-bg py-10 sm:py-14">
      <div className="container-site">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-site-accent">
              Проверьте сейчас
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-site-text sm:text-4xl">
              Не откладывайте диагностику
            </h2>
          </div>
          <PhoneLink
            className="w-fit"
            phone={phone}
            phoneHref={phoneHref}
            variant="accent"
          >
            Позвонить
          </PhoneLink>
        </div>
        <ul className="mt-6 grid gap-2 sm:grid-cols-3">
          {symptoms.map(({ icon, question }) => (
            <li
              className="flex min-h-[76px] items-center gap-3 rounded-md border border-white/10 bg-surface px-4 py-3"
              key={question}
            >
              <Icon
                aria-hidden="true"
                className="shrink-0 text-site-accent"
                icon={icon}
                size={21}
              />
              <span>
                <strong className="block text-sm font-bold text-site-text">
                  {question}
                </strong>
                <span className="mt-1 block text-xs text-site-muted">
                  Проведём диагностику и назовём причину.
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}