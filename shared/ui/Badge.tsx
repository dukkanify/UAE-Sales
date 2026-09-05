import type { HTMLAttributes, ReactNode } from "react";
import { Copy } from "@/shared/i18n/LocalizedTree";

type BadgeVariant =
  | "verified"
  | "premium"
  | "escrow"
  | "featured"
  | "new"
  | "urgent"
  | "sold"
  | "pending"
  | "rejected"
  | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  verified: "border-emerald-600/20 bg-emerald-50 text-emerald-700",
  premium: "border-secondary/35 bg-secondary-soft text-[#8a7040]",
  escrow: "border-success/20 bg-success-soft text-success",
  featured: "border-[#c9a45c]/35 bg-[#c9a45c] text-[#0b1628]",
  new: "border-sky-500/25 bg-sky-50 text-sky-700",
  urgent: "border-rose-600/30 bg-rose-600 text-white",
  sold: "border-border bg-surface-muted text-muted",
  pending: "border-amber-500/25 bg-amber-50 text-amber-800",
  rejected: "border-rose-500/20 bg-rose-50 text-rose-700",
  muted: "border-border bg-surface-muted text-muted",
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
      {typeof children === "string" ? <Copy text={children} /> : children}
    </span>
  );
}
