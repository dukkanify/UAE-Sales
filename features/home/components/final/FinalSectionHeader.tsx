import type { ReactNode } from "react";

type FinalSectionHeaderProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function FinalSectionHeader({
  action,
  description,
  title,
}: FinalSectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-base leading-7 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
