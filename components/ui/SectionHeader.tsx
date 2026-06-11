import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({
  action,
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-3 inline-flex rounded-full border border-primary/15 bg-primary-soft px-3.5 py-1.5 text-xs font-black text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 leading-8 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
