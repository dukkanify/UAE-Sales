import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "verified"
  | "premium"
  | "escrow"
  | "featured"
  | "new"
  | "sold"
  | "pending"
  | "rejected"
  | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  verified: "border-primary/15 bg-primary-soft text-primary",
  premium: "border-secondary/25 bg-secondary-soft text-primary",
  escrow: "border-success/15 bg-success-soft text-success",
  featured: "border-secondary/20 bg-secondary-soft text-primary",
  new: "border-accent/15 bg-accent-soft text-accent",
  sold: "border-border bg-surface-muted text-muted",
  pending: "border-secondary/25 bg-primary-soft text-primary",
  rejected: "border-accent/20 bg-accent-soft text-accent",
  muted: "border-border bg-surface text-muted",
};

export function Badge({
  children,
  className = "",
  variant = "featured",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-lg)] border px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
