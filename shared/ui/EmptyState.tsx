import type { ReactNode } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  description: string;
  eyebrow?: string;
  icon?: "search" | "package" | "message" | "wallet" | "photo" | "shield";
  title: string;
};

const iconMap = {
  message: "message",
  package: "package",
  photo: "photo",
  search: "search",
  shield: "shield",
  wallet: "wallet",
} as const;

export function EmptyState({
  actionHref,
  actionLabel,
  children,
  description,
  eyebrow,
  icon = "package",
  title,
}: EmptyStateProps) {
  return (
    <Card className="p-10 text-center" variant="flat">
      <span className="mx-auto grid size-14 place-items-center rounded-[var(--radius-2xl)] bg-surface-muted text-secondary">
        <Icon name={iconMap[icon]} size={24} />
      </span>
      {eyebrow ? (
        <p className="mt-5 text-xs font-medium tracking-wide text-secondary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`${eyebrow ? "mt-2" : "mt-5"} text-xl font-black text-ink`}>
        {title}
      </h2>
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
