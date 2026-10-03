import { processSteps } from "@/content/process";
import { Reveal } from "@/components/ui/Reveal";

export function ProcessSection() {
  return (
    <section className="bg-site-bg" id="process">
      <div className="container-site py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-site-accent">
          Понятный процесс
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-site-text sm:text-4xl">
          От записи до выдачи автомобиля
        </h2>
        <ol className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {processSteps.map((step) => (
            <li
              className="relative border-l border-site-accent pl-4 pt-1 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-4"
              key={step.number}
            >
              <Reveal>
                <p className="text-xs font-extrabold tracking-[0.12em] text-site-accent">
                  {step.number}
                </p>
                <h3 className="mt-2 text-base font-bold text-site-text">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-site-muted">
                  {step.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}