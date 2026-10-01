import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="container-site flex min-h-18 items-center justify-between gap-6">
          <Link
            className="font-serif text-2xl font-semibold tracking-widest text-ink"
            href="/admin"
          >
            РЕМЗОНА
          </Link>
          <nav
            aria-label="Административная навигация"
            className="flex items-center gap-2 sm:gap-5"
          >
            <Link
              className="min-h-11 px-3 py-3 text-sm text-ink hover:underline"
              href="/admin/services"
            >
              Услуги
            </Link>
            <Link
              className="min-h-11 px-3 py-3 text-sm text-ink hover:underline"
              href="/admin/settings"
            >
              Настройки
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container-site py-10 sm:py-14">{children}</main>
    </div>
  );
}
