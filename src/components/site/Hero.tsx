import Image from "next/image";
import { ArrowRight, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

const proofPoints = [
  { icon: ShieldCheck, title: "Гарантия", description: "на работы 12 месяцев" },
  { icon: Settings, title: "Современное", description: "оборудование" },
  { icon: UsersRound, title: "Опытные мастера", description: "с большим стажем" },
];

export function Hero() {
  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-site-bg text-site-text sm:min-h-[660px] lg:min-h-[552px]">
      <div className="absolute inset-0">
        <Image
          alt="Мастер обслуживает автомобиль с открытым капотом в РЕМЗОНЕ"
          className="object-cover object-center"
          fill
          preload
          sizes="100vw"
          src="/images/back_bmw.png"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,15,0.68)_0%,rgba(8,12,15,0.56)_36%,rgba(8,12,15,0.16)_70%,rgba(8,12,15,0.04)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-site-bg/55 via-transparent to-site-bg/10"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-[1440px] items-center px-5 py-10 sm:min-h-[660px] sm:px-8 lg:min-h-[552px] lg:px-10 lg:py-8">
        <div className="max-w-[780px]">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase text-site-text sm:text-xs">
            <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-site-accent" />
            Автосервис в Серпухове
          </p>
          <h1 className="mt-5 max-w-[760px] text-[30px] font-extrabold leading-[1.08] text-site-text sm:text-[50px] sm:leading-[1.02] lg:text-[56px]">
            Ремонт автомобиля
            <br />
            <span className="text-site-accent">без сюрпризов</span> в чеке
          </h1>
          <p className="mt-5 max-w-[540px] text-sm leading-5 text-site-text/80 sm:text-base sm:leading-6">
            Диагностика, ТО и ремонт любых иномарок и отечественных авто.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="inline-flex min-h-[60px] items-center justify-center gap-5 rounded-md bg-site-accent px-7 text-sm font-bold text-white transition-colors hover:bg-white hover:text-site-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent"
              href="#contacts"
            >
              Записаться на сервис <Icon icon={ArrowRight} size={18} />
            </a>
          </div>
          <ul className="mt-10 grid max-w-[790px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0">
            {proofPoints.map((item, index) => (
              <li
                className={`flex items-center gap-3 border-l-2 border-site-accent pl-3 sm:border-l-0 sm:px-6 sm:pl-6 first:sm:pl-0 last:pr-0 ${index < proofPoints.length - 1 ? "sm:border-r sm:border-white/20" : ""}`}
                key={item.title}
              >
                <Icon
                  aria-hidden="true"
                  className="shrink-0 text-site-text"
                  icon={item.icon}
                  size={30}
                />
                <span className="text-xs leading-4">
                  <strong className="block font-bold text-site-text">
                    {item.title}
                  </strong>
                  <span className="text-site-text/75">{item.description}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[11px] font-semibold text-site-text/70">
            Работаем с автомобилями любых марок
          </p>
        </div>
      </div>
    </section>
  );
}
