"use client";

import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { Icon } from "@/components/ui/Icon";

type MobileActionBarProps = {
  phone: string;
  phoneHref: string;
};

export function MobileActionBar({
  phone,
  phoneHref,
}: MobileActionBarProps) {
  const pathname = usePathname();
  const servicesHref = pathname === "/" ? "#services" : "/#services";

  return (
    <nav
      aria-label="Быстрые действия"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-site-bg/95 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur-xl xl:hidden"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <PhoneLink
          className="min-h-11 flex-1"
          phone={phone}
          phoneHref={phoneHref}
          variant="accent"
        >
          Позвонить
        </PhoneLink>
        <a
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-white/20 px-4 text-sm font-bold text-site-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
          href={servicesHref}
        >
          Услуги <Icon aria-hidden="true" icon={ArrowRight} size={15} />
        </a>
      </div>
    </nav>
  );
}