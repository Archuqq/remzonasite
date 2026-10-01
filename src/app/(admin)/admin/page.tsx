import { getSettings } from "@/lib/settings";
import { getAllServices } from "@/lib/service-store";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [settings, services] = await Promise.all([
    getSettings(),
    getAllServices(),
  ]);
  const publishedServices = services.filter((service) => service.isPublished).length;

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Панель управления
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Обзор</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          label="Опубликованные услуги"
          value={String(publishedServices)}
        />
        <DashboardCard label="Телефон" value={settings.phone} />
        <DashboardCard
          label="Отзывы на сайте"
          value={settings.reviewsEnabled ? "Включены" : "Выключены"}
        />
      </div>
      {publishedServices === 0 ? (
        <p className="mt-8 text-base text-muted">
          Услуг пока нет — добавьте первую в разделе «Услуги».
        </p>
      ) : null}
    </section>
  );
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-4 break-words font-serif text-2xl text-ink">{value}</p>
    </div>
  );
}
