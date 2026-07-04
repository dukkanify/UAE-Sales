import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
  secondary:
    "border border-border bg-surface text-ink shadow-[var(--shadow-xs)] hover:border-secondary/50",
  ghost: "text-muted hover:bg-surface-muted hover:text-ink",
  accent:
    "bg-secondary text-primary shadow-[var(--shadow-glow)] hover:bg-primary hover:text-white",
};

const sizeClasses = {
  sm: "min-h-9 px-3.5 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function Button({
  children,
  className = "",
  fullWidth = false,
  size = "md",
  variant = "accent",
  ...props
}: ButtonProps) {
  const content =
    typeof children === "string" && children.trim().length === 0
      ? "إجراء"
      : (children ?? "إجراء");

  return (
    <button
      className={`focus-ring interactive-lift inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-bold transition duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
