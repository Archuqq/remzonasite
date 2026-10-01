import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ReviewsWidget } from "@/components/site/ReviewsWidget";

type ReviewsSectionProps = {
  enabled: boolean;
  yandexOrgId: string;
};

export function ReviewsSection({
  enabled,
  yandexOrgId,
}: ReviewsSectionProps) {
  if (!enabled) return null;

  const reviewsUrl = `https://yandex.ru/maps/org/remzona/${encodeURIComponent(yandexOrgId)}/reviews`;

  return (
    <section className="border-y border-line bg-surface" id="reviews">
      <Section
        className="bg-surface"
        description="Отзывы клиентов о работе сервиса"
        headerAction={
          <a
            className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            href={reviewsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Все отзывы на Яндекс Картах →
          </a>
        }
        title="Нам доверяют"
      >
        <Reveal>
          <ReviewsWidget enabled={enabled} yandexOrgId={yandexOrgId} />
        </Reveal>
      </Section>
    </section>
  );
}