import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "glass" | "flat";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]",
  elevated:
    "rounded-[var(--radius-lg)] border border-border bg-surface-elevated shadow-[var(--shadow-lg)]",
  glass: "glass-panel rounded-[var(--radius-lg)]",
  flat: "rounded-[var(--radius-lg)] border border-border bg-surface",
};

export function Card({
  children,
  className = "",
  interactive = false,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={`${variantClasses[variant]} ${interactive ? "interactive-lift" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
