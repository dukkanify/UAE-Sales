import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "glass" | "flat";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]",
  elevated:
    "rounded-[var(--radius-xl)] border border-border bg-surface-elevated shadow-[var(--shadow-lg)]",
  glass:
    "glass-panel rounded-[var(--radius-lg)]",
  flat:
    "rounded-[var(--radius-lg)] border border-border bg-surface",
};

export function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
