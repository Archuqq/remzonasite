import type { MouseEventHandler, ReactNode } from "react";
import { Phone } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

type PhoneLinkVariant = "text" | "primary" | "secondary" | "light" | "accent";

type PhoneLinkProps = {
  phone: string;
  phoneHref: string;
  className?: string;
  label?: string;
  iconOnly?: boolean;
  preview?: boolean;
  variant?: PhoneLinkVariant;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const variants: Record<PhoneLinkVariant, string> = {
  text: "text-ink hover:text-muted",
  primary:
    "rounded-md bg-ink px-5 text-white hover:bg-signal hover:text-ink",
  secondary:
    "rounded-md border border-ink px-5 text-ink hover:bg-ink hover:text-white",
  light:
    "rounded-md border border-white bg-white px-5 text-dark hover:bg-bg hover:text-dark",
  accent:
    "rounded-md bg-site-accent px-5 text-white hover:bg-white hover:text-site-bg",
};

export function PhoneLink({
  phone,
  phoneHref,
  className = "",
  label,
  iconOnly = false,
  preview = false,
  variant = "text",
  children,
  onClick,
}: PhoneLinkProps) {
  const classNames =
    `inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${variants[variant]} ${className}`.trim();
  const content = (
    <>
      <Icon icon={Phone} size={17} />
      {iconOnly ? (
        <span className="sr-only">{label || phone}</span>
      ) : (
        (children ?? phone)
      )}
    </>
  );

  if (preview) {
    return (
      <span aria-hidden="true" className={classNames}>
        {content}
      </span>
    );
  }

  return (
    <a
      aria-label={iconOnly ? label || `Позвонить: ${phone}` : undefined}
      className={classNames}
      href={phoneHref}
      onClick={onClick}
    >
      {content}
    </a>
  );
}
