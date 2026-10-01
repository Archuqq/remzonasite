"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PhoneLink } from "@/components/ui/PhoneLink";

export type SiteHeaderSettings = {
  phone: string;
  phoneHref: string;
  reviewsEnabled: boolean;
};

type HeaderProps = {
  settings: SiteHeaderSettings;
};

const baseLinks = [
  { href: "#services", label: "Услуги" },
  { href: "#about", label: "О нас" },
];

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const links = [
    ...baseLinks,
    ...(settings.reviewsEnabled ? [{ href: "#reviews", label: "Отзывы" }] : []),
    { href: "#contacts", label: "Контакты" },
  ];

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
        className="sticky top-0 z-40 border-b border-line/80 bg-bg/95 backdrop-blur-md"
        id="top"
      >
        <div className="container-site relative flex min-h-[76px] items-center justify-between gap-4">
          <Link
            aria-label="РЕМЗОНА — на главную"
            className="shrink-0 font-serif text-2xl font-semibold tracking-[0.12em] text-ink sm:text-[27px]"
            href="/"
          >
            РЕМЗОНА
          </Link>

          <nav
            aria-label="Основная навигация"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 xl:flex"
          >
            {links.map((link) => (
              <a
                className="text-sm font-medium text-ink transition-colors hover:text-muted focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                href={pathname === "/" ? link.href : `/${link.href}`}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 xl:flex">
            <PhoneLink phone={settings.phone} phoneHref={settings.phoneHref} />
            <PhoneLink
              className="focus-visible:outline-offset-2"
              phone={settings.phone}
              phoneHref={settings.phoneHref}
              variant="primary"
            >
              Позвонить
            </PhoneLink>
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <PhoneLink
              className="size-11 rounded-md border border-line text-ink"
              iconOnly
              label={`Позвонить: ${settings.phone}`}
              phone={settings.phone}
              phoneHref={settings.phoneHref}
            />
            <button
              aria-controls="mobile-site-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              className="inline-flex size-11 items-center justify-center rounded-md border border-line text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              onClick={() => setMenuOpen((open) => !open)}
              ref={triggerRef}
              type="button"
            >
              <Icon icon={menuOpen ? X : Menu} size={21} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-bg xl:hidden"
          id="mobile-site-menu"
          ref={menuRef}
          role="dialog"
          aria-label="Основная навигация"
          aria-modal="true"
        >
          <div className="container-site flex min-h-[76px] items-center justify-between border-b border-line">
            <Link
              className="font-serif text-2xl font-semibold tracking-[0.12em] text-ink"
              href="/"
              onClick={closeMenu}
            >
              РЕМЗОНА
            </Link>
            <button
              aria-label="Закрыть меню"
              className="inline-flex size-11 items-center justify-center rounded-md border border-line text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              onClick={closeMenu}
              type="button"
            >
              <Icon icon={X} size={21} />
            </button>
          </div>
          <nav
            aria-label="Основная навигация"
            className="container-site flex flex-col py-8"
          >
            {links.map((link) => (
              <a
                className="border-b border-line py-5 font-serif text-3xl text-ink focus-visible:outline-2 focus-visible:outline-ink"
                href={pathname === "/" ? link.href : `/${link.href}`}
                key={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <PhoneLink
              className="mt-8 min-h-12 w-fit focus-visible:outline-offset-2"
              phone={settings.phone}
              phoneHref={settings.phoneHref}
              variant="primary"
              onClick={closeMenu}
            >
              Позвонить
            </PhoneLink>
            <p className="mt-5 text-sm text-muted">{settings.phone}</p>
          </nav>
        </div>
      ) : null}
    </>
  );
}
