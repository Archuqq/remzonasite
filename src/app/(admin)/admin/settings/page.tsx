import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Панель управления
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Настройки</h1>
      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </section>
  );
}
