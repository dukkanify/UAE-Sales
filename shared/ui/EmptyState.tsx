import type { ReactNode } from "react";
import { Button } from "@/shared/ui/Button";
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
    <div className="marketplace-panel animate-fade-in p-10 text-center sm:p-12">
      <span className="relative mx-auto grid size-16 place-items-center rounded-[var(--radius-2xl)] bg-gradient-to-br from-secondary-soft to-surface-muted text-secondary shadow-[var(--shadow-sm)]">
        <Icon name={iconMap[icon]} size={28} />
        <span
          aria-hidden
          className="absolute -inset-1 -z-10 rounded-[var(--radius-2xl)] bg-secondary/10 blur-md"
        />
      </span>
      {eyebrow ? (
        <p className="mt-6 text-xs font-bold tracking-wide text-[#B8955F] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`${eyebrow ? "mt-2" : "mt-6"} text-xl font-black text-ink sm:text-2xl`}>
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-muted">
        {description}
      </p>
      {children}
      {actionHref && actionLabel ? (
        <Button className="mt-7" href={actionHref} variant="primary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
