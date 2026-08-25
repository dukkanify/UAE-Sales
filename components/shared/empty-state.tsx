import Link from "@/components/ui/app-link";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  const action =
    actionLabel && actionHref ? (
      <Button className="mt-6" asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    ) : actionLabel && onAction ? (
      <Button className="mt-6" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center",
        className,
      )}
      role="status"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden
      >
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

export { EmptyState };
