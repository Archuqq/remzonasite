import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="admin-theme flex min-h-screen items-center justify-center bg-bg px-5 py-12 text-ink">
      {children}
    </main>
  );
}
