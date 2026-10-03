import type { HTMLAttributes, ReactNode } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  eyebrowClassName?: string;
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children?: ReactNode;
};

export function Section({
  eyebrow,
  eyebrowClassName,
  title,
  description,
  headerAction,
  children,
  className = "",
  ...props
}: SectionProps) {
  return (
    <section className={`py-20 sm:py-24 ${className}`.trim()} {...props}>
      <div className="container-site">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p
                className={`text-xs font-semibold uppercase tracking-[0.16em] ${eyebrowClassName ?? "text-muted"}`}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-3 font-serif text-4xl font-medium text-ink sm:text-5xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </header>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
