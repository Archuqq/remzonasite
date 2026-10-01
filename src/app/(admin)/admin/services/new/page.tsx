import Link from "next/link";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Услуги
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Новая карточка</h1>
      <p className="mt-3">
        <Link className="text-sm text-muted underline" href="/admin/services">
          ← К списку
        </Link>
      </p>
      <div className="mt-8">
        <ServiceForm mode="create" />
      </div>
    </section>
  );
}
