type ReviewsWidgetProps = {
  enabled: boolean;
  yandexOrgId: string;
};

export function ReviewsWidget({
  enabled,
  yandexOrgId,
}: ReviewsWidgetProps) {
  if (!enabled) return null;

  const widgetUrl = `https://yandex.ru/maps-reviews-widget/${encodeURIComponent(yandexOrgId)}?comments`;
  const reviewsUrl = `https://yandex.ru/maps/org/remzona/${encodeURIComponent(yandexOrgId)}/reviews`;

  return (
    <div className="mx-auto w-full max-w-[763px] overflow-hidden rounded-lg border border-line bg-surface">
      <iframe
        className="block h-[640px] w-full border-0 sm:h-[720px]"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={widgetUrl}
        title="Отзывы клиентов РЕМЗОНА на Яндекс Картах"
      />
      <div className="border-t border-line px-5 py-4 sm:px-6">
        <a
          className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          href={reviewsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Открыть все отзывы на Яндекс Картах →
        </a>
      </div>
    </div>
  );
}