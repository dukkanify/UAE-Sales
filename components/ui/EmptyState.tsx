import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  description: string;
  icon?: string;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  children,
  description,
  icon = "📭",
  title,
}: EmptyStateProps) {
  return (
    <Card className="p-10 text-center" variant="flat">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-muted text-2xl">
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md leading-8 text-muted">{description}</p>
      {children}
      {actionHref && actionLabel ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:-translate-y-px"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </Card>
  );
}
