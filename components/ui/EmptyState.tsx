import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  description: string;
  icon?: "search" | "package" | "message" | "wallet" | "photo";
  title: string;
};

const iconMap = {
  message: "message",
  package: "package",
  photo: "photo",
  search: "search",
  wallet: "wallet",
} as const;

export function EmptyState({
  actionHref,
  actionLabel,
  children,
  description,
  icon = "package",
  title,
}: EmptyStateProps) {
  return (
    <Card className="p-10 text-center" variant="flat">
      <span className="mx-auto grid size-14 place-items-center rounded-[var(--radius-lg)] bg-surface-muted text-secondary">
        <Icon name={iconMap[icon]} size={24} />
      </span>
      <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-7 text-muted">
        {description}
      </p>
      {children}
      {actionHref && actionLabel ? (
        <Button className="mt-6" href={actionHref}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
