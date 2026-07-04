import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "gold"
  | "success"
  | "accent"
  | "muted"
  | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-muted text-ink",
  gold: "border-secondary/20 bg-secondary-soft text-primary",
  success: "border-success/15 bg-success-soft text-success",
  accent: "border-accent/15 bg-accent-soft text-accent",
  muted: "border-border bg-surface text-muted",
  warning: "border-secondary/25 bg-primary-soft text-primary",
};

export function Badge({
  children,
  className = "",
  variant = "gold",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-bold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
