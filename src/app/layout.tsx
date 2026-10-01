import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteTitle = "РЕМЗОНА — автосервис в Серпухове";
const siteDescription =
  "Диагностика, плановое ТО и ремонт любых иномарок и отечественных авто. Называем цену до начала работ — без сюрпризов в чеке.";

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: env.SITE_URL,
    siteName: "РЕМЗОНА",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/images/hero-1600.webp",
        width: 1600,
        height: 901,
        alt: "Mercedes в автосервисе РЕМЗОНА",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/hero-1600.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${cormorant.variable} bg-bg font-sans text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
