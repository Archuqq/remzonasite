import { PasswordForm } from "@/components/admin/PasswordForm";

export default function AdminPasswordPage() {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Настройки
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Смена пароля</h1>
      <p className="mb-8 mt-4 max-w-xl text-sm leading-6 text-muted">
        После смены пароля текущая сессия завершится. Войдите с новым паролем.
      </p>
      <PasswordForm />
    </section>
  );
}
