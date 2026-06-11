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
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-bold text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
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
