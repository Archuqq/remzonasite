import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { getServiceById } from "@/lib/service-store";
import { serializeService } from "@/lib/services";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Услуги
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Редактирование</h1>
      <p className="mt-3">
        <Link className="text-sm text-muted underline" href="/admin/services">
          ← К списку
        </Link>
      </p>
      <div className="mt-8">
        <ServiceForm mode="edit" service={serializeService(service)} />
      </div>
    </section>
  );
}
