import { LoginForm } from "@/components/admin/LoginForm";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <section className="w-full max-w-md rounded-lg border border-line bg-surface p-7 shadow-sm sm:p-9">
      <Link className="font-serif text-3xl font-semibold text-ink" href="/">
        РЕМЗОНА
      </Link>
      <p className="mt-2 text-sm text-muted">Панель управления</p>
      <h1 className="mt-8 font-serif text-3xl text-ink">Вход администратора</h1>
      <LoginForm />
    </section>
  );
}
