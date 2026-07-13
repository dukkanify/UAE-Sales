import type { ReactNode } from "react";

type PageHeroProps = {
  children?: ReactNode;
  compact?: boolean;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageHero({
  children,
  compact = false,
  description,
  eyebrow,
  title,
}: PageHeroProps) {
  return (
    <div
      className={`surface-gradient overflow-hidden rounded-[var(--radius-2xl)] border border-border shadow-[var(--shadow-md)] ${
        compact
          ? "mb-4 p-4 md:mb-6 md:p-6"
          : "mb-8 p-6 md:mb-10 md:p-8"
      }`}
    >
      {children}
      {eyebrow ? (
        <p className="text-xs font-medium tracking-wide text-secondary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`mt-1 font-black tracking-tight text-ink ${
          compact ? "text-2xl md:text-3xl" : "mt-2 text-3xl md:text-4xl"
        }`}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={`max-w-2xl text-sm font-medium leading-7 text-muted sm:text-base sm:leading-8 ${
            compact ? "mt-2" : "mt-3"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
