import { processSteps } from "@/content/process";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function ProcessSection() {
  return (
    <section className="bg-section-alt" id="process">
      <Section
        className="bg-section-alt"
        description="От записи до выдачи автомобиля — всё прозрачно."
        title="Простой и понятный цикл"
      >
        <ol className="grid gap-8 lg:grid-cols-5 lg:gap-6">
          {processSteps.map((step, index) => (
            <li
              className="relative border-l border-line pl-5 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6"
              key={step.number}
            >
              {index < processSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-6 left-[-5px] text-lg text-muted lg:bottom-auto lg:left-auto lg:right-[-14px] lg:top-[-13px]"
                >
                  →
                </span>
              ) : null}
              <Reveal>
                <p className="font-serif text-4xl leading-none text-muted/60">
                  {step.number}
                </p>
                <h3 className="mt-4 font-serif text-2xl font-medium text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[220px] text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>
    </section>
  );
}