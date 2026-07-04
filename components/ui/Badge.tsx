import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "default" | "gold" | "success" | "accent" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-muted text-ink",
  gold: "border-secondary/25 bg-secondary-soft text-primary",
  success: "border-success/20 bg-success-soft text-success",
  accent: "border-accent/20 bg-accent-soft text-accent",
  muted: "border-border bg-surface text-muted",
};

export function Badge({
  children,
  className = "",
  variant = "gold",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
