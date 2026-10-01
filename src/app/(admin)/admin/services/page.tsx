import Link from "next/link";
import { ServicesList } from "@/components/admin/ServicesList";
import { getAllServices } from "@/lib/service-store";
import { serializeService } from "@/lib/services";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const services = await getAllServices();

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Панель управления
          </p>
          <h1 className="mt-3 font-serif text-4xl text-ink">Услуги</h1>
        </div>
        <Link
          className="inline-flex min-h-12 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white"
          href="/admin/services/new"
        >
          Добавить услугу
        </Link>
      </div>
      {saved ? (
        <p className="mt-6 rounded-md border border-line bg-section-alt px-4 py-3 text-sm text-ink">
          Карточка сохранена.
        </p>
      ) : null}
      <ServicesList
        key={services
          .map((service) => `${service.id}:${service.updatedAt}`)
          .join("|")}
        services={services.map(serializeService)}
      />
    </section>
  );
}
