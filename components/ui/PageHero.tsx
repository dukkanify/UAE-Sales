import type { ReactNode } from "react";

type PageHeroProps = {
  children?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageHero({
  children,
  description,
  eyebrow,
  title,
}: PageHeroProps) {
  return (
    <div className="surface-gradient mb-8 overflow-hidden rounded-[var(--radius-2xl)] border border-border p-6 shadow-[var(--shadow-md)] md:mb-10 md:p-8">
      {children}
      {eyebrow ? (
        <p className="text-xs font-medium tracking-wide text-secondary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-black tracking-tight text-ink md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base font-medium leading-8 text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
