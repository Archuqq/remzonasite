import Image from "next/image";
export function PromoBanner() {
  return (
    <section
      className="relative z-20 -mt-[calc((100vw-40px)/7)] bg-transparent pb-3 pt-0 sm:mt-0 sm:bg-site-bg sm:pb-4"
      id="promo"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-lg border border-site-accent/50 bg-site-bg sm:h-[172px]">
          <div className="relative aspect-[7/1] sm:absolute sm:inset-0 sm:aspect-auto">
            <Image
              alt="Акция для новых клиентов: бесплатная диагностика за 0 рублей"
              className="scale-[1.035] object-cover object-center"
              fill
              sizes="(min-width: 1440px) 1360px, 100vw"
              src="/images/newBanner.png"
            />
          </div>
        </div>
        <p
          className="mx-auto max-w-[1360px] px-1 pt-2 text-[10px] leading-4 text-site-muted sm:text-[11px] sm:leading-5"
          id="diagnostics-terms"
        >
          * Бесплатная диагностика предоставляется при условии заказа и выполнения ремонта в автосервисе РЕМЗОНА. При отказе от ремонта диагностика оплачивается по действующему прайс-листу; ее стоимость сообщается и согласовывается до начала диагностики.
        </p>
      </div>
    </section>
  );
}