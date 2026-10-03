import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileActionBar } from "@/components/site/MobileActionBar";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="site-theme min-h-screen bg-bg pb-[calc(4rem+env(safe-area-inset-bottom))] text-ink xl:pb-0">
      <Header settings={settings} />
      {children}
      <Footer settings={settings} />
      <MobileActionBar phone={settings.phone} phoneHref={settings.phoneHref} />
    </div>
  );
}
