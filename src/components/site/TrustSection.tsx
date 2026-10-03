import Image from "next/image";

const trustFacts = [
  { headline: "12 месяцев", detail: "гарантия на работы" },
  { headline: "10+ лет", detail: "опыт в автосервисе" },
  { headline: "До начала работ", detail: "согласуем стоимость" },
];

export function TrustSection() {
  return (
    <section className="relative isolate overflow-hidden bg-site-bg" id="about">
      <Image
        alt=""
        className="object-cover object-[50%_58%]"
        fill
        sizes="100vw"
        src="/images/доверяют.png"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,15,0.96)_0%,rgba(8,12,15,0.82)_45%,rgba(8,12,15,0.62)_100%)]"
      />
      <div className="container-site relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12 lg:py-20">
        <div className="max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-site-accent">
            Почему выбирают нас
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.02] text-site-text sm:text-5xl">
            Нам доверяют своё авто
          </h2>
        </div>
        <ul className="grid gap-5 sm:grid-cols-3 sm:gap-0">
          {trustFacts.map((fact) => (
            <li
              className="min-w-0 border-l border-site-accent/35 pl-4 sm:px-4 lg:px-5"
              key={fact.headline}
            >
              <p className="text-xl font-extrabold leading-tight text-site-accent sm:text-2xl">
                {fact.headline}
              </p>
              <p className="mt-2 text-xs leading-5 text-site-text sm:text-sm">
                {fact.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}