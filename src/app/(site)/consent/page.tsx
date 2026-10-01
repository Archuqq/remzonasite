import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных | РЕМЗОНА",
  robots: { index: false, follow: true },
};

export default function ConsentPage() {
  return (
    <main className="min-h-[60svh] py-16 sm:py-24">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Документы
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl text-ink sm:text-5xl">
          Согласие на обработку персональных данных
        </h1>
        <div className="mt-8 max-w-3xl space-y-5 text-base leading-7 text-muted">
          <p>
            Эта страница содержит шаблон. До запуска владелец сайта должен
            предоставить текст согласия и определить применимый порядок его
            получения и отзыва.
          </p>
          <p>
            В текущем публичном каркасе нет формы записи и сбора заявок. Не
            публикуйте этот шаблон как окончательный юридический документ без
            проверки фактических сценариев обработки данных.
          </p>
        </div>
      </Container>
    </main>
  );
}
