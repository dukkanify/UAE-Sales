import type { ReactNode } from "react";

type Home3SectionHeaderProps = {
  action?: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
};

export function Home3SectionHeader({
  action,
  description,
  eyebrow,
  title,
}: Home3SectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-black tracking-[0.24em] text-secondary uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base font-medium leading-8 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
