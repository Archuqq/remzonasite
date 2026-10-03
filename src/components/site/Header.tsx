"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cog, MapPin, Menu, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { YANDEX_MAP_LOCATION_URL } from "@/lib/map";

export type SiteHeaderSettings = {
  phone: string;
  phoneHref: string;
  address: string;
  reviewsEnabled: boolean;
};

type HeaderProps = {
  settings: SiteHeaderSettings;
};

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const links = [
    { href: "#services", label: "Услуги" },
    { href: "#about", label: "О нас" },
    { href: "#promo", label: "Акции" },
    ...(settings.reviewsEnabled ? [{ href: "#reviews", label: "Отзывы" }] : []),
    { href: "#contacts", label: "Контакты" },
  ];

  function sectionHref(href: string) {
    return pathname === "/" ? href : `/${href}`;
  }

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-white/10 bg-site-bg/95 text-site-text backdrop-blur-xl"
        id="top"
      >
        <div className="container-site grid min-h-[72px] grid-cols-[1fr_auto] items-center gap-4 xl:grid-cols-[190px_minmax(0,1fr)_170px_192px] xl:gap-4">
          <Link
            aria-label="ДИЗЕЛЬ СЕРВИС — на главную"
            className="flex w-fit items-center gap-2"
            href="/"
          >
            <Icon className="text-site-accent" icon={Cog} size={31} strokeWidth={2.5} />
            <span className="leading-none">
              <span className="block text-[21px] font-extrabold tracking-[-0.04em] text-site-text">
                ДИЗЕЛЬ<span className="text-site-accent">СЕРВИС</span>
              </span>
              <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.14em] text-site-muted">
                Автосервис в Серпухове
              </span>
            </span>
          </Link>

          <nav
            aria-label="Основная навигация"
            className="hidden items-center justify-center gap-4 2xl:gap-6 xl:flex"
          >
            {links.map((link) => (
              <a
                className="whitespace-nowrap text-xs font-medium text-site-muted transition-colors hover:text-site-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-site-accent 2xl:text-sm"
                href={sectionHref(link.href)}
                key={`${link.label}-${link.href}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            className="hidden min-w-0 items-center gap-2 text-[13px] leading-[1.35] text-site-muted transition-colors hover:text-site-text xl:flex"
            href={YANDEX_MAP_LOCATION_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="shrink-0 text-site-accent" icon={MapPin} size={16} />
            <span className="min-w-0">{settings.address}</span>
          </a>

          <div className="hidden xl:flex xl:justify-end">
            <PhoneLink
              className="min-h-10 whitespace-nowrap px-3 text-xs 2xl:px-4 2xl:text-sm"
              phone={settings.phone}
              phoneHref={settings.phoneHref}
              variant="accent"
            >
              {settings.phone}
            </PhoneLink>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <PhoneLink
              className="size-10 rounded-full border border-white/15 text-site-text"
              iconOnly
              label={`Позвонить: ${settings.phone}`}
              phone={settings.phone}
              phoneHref={settings.phoneHref}
            />
            <button
              aria-controls="mobile-site-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-site-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
              onClick={() => setMenuOpen((open) => !open)}
              ref={triggerRef}
              type="button"
            >
              <Icon icon={menuOpen ? X : Menu} size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-site-bg text-site-text xl:hidden"
          id="mobile-site-menu"
          ref={menuRef}
          role="dialog"
          aria-label="Основная навигация"
          aria-modal="true"
        >
          <div className="container-site flex min-h-[72px] items-center justify-between border-b border-white/10">
            <Link
              className="text-lg font-extrabold"
              href="/"
              onClick={closeMenu}
            >
              ДИЗЕЛЬ<span className="text-site-accent">СЕРВИС</span>
            </Link>
            <button
              aria-label="Закрыть меню"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/15"
              onClick={closeMenu}
              type="button"
            >
              <Icon icon={X} size={20} />
            </button>
          </div>
          <nav
            aria-label="Основная навигация"
            className="container-site flex flex-col py-5"
          >
            {links.map((link) => (
              <a
                className="border-b border-white/10 py-4 font-serif text-2xl text-site-text focus-visible:outline-2 focus-visible:outline-site-accent"
                href={sectionHref(link.href)}
                key={`${link.label}-${link.href}`}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <PhoneLink
              className="mt-6 w-fit"
              phone={settings.phone}
              phoneHref={settings.phoneHref}
              variant="accent"
              onClick={closeMenu}
            >
              Позвонить
            </PhoneLink>
          </nav>
        </div>
      ) : null}
    </>
  );
}
