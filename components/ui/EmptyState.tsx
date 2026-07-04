import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon?: string;
  title: string;
  children?: ReactNode;
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
    <Card className="overflow-hidden p-8 text-center">
      <div className="uae-flag-strip mx-auto mb-6 h-1.5 w-24 rounded-full" />
      <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-secondary/25 bg-secondary-soft text-3xl">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md leading-8 text-muted">{description}</p>
      {children}
      {actionHref && actionLabel ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-6 py-2.5 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </Card>
  );
}
