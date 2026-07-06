import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "glass" | "flat" | "panel" | "stat";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
  padding?: CardPadding;
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-card)]",
  elevated:
    "rounded-[var(--radius-2xl)] border border-border bg-surface-elevated shadow-[var(--shadow-lg)]",
  glass: "glass-panel rounded-[var(--radius-2xl)]",
  flat: "rounded-[var(--radius-2xl)] border border-border bg-surface",
  panel: "marketplace-panel",
  stat: "marketplace-stat-card",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className = "",
  interactive = false,
  padding,
  variant = "default",
  ...props
}: CardProps) {
  const paddingClass =
    padding !== undefined
      ? paddingClasses[padding]
      : variant === "panel" || variant === "stat"
        ? ""
        : "";

  return (
    <div
      className={`${variantClasses[variant]} ${paddingClass} ${interactive ? "interactive-lift" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
