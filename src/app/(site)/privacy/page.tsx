import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | РЕМЗОНА",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-[60svh] py-16 sm:py-24">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Документы
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl text-ink sm:text-5xl">
          Политика конфиденциальности
        </h1>
        <div className="mt-8 max-w-3xl space-y-5 text-base leading-7 text-muted">
          <p>
            Эта страница содержит шаблон. Перед публикацией владелец сайта
            должен предоставить и утвердить юридический текст, соответствующий
            фактическим процессам обработки данных.
          </p>
          <p>
            На сайте используются контактные данные автосервиса для связи с
            посетителями. Состав, цели, сроки хранения и порядок обработки
            персональных данных должны быть описаны в утверждённой редакции
            документа.
          </p>
        </div>
      </Container>
    </main>
  );
}
