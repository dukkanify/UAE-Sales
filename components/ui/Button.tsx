import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-sm)] hover:-translate-y-px hover:shadow-[var(--shadow-md)] active:translate-y-0",
  secondary:
    "border border-border bg-surface text-ink shadow-[var(--shadow-xs)] hover:-translate-y-px hover:border-secondary/50 hover:shadow-[var(--shadow-sm)]",
  ghost:
    "text-muted hover:bg-surface-muted hover:text-ink",
  accent:
    "bg-secondary text-primary shadow-[var(--shadow-glow)] hover:-translate-y-px hover:bg-primary hover:text-white",
};

const sizeClasses = {
  sm: "min-h-9 px-4 py-2 text-xs",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-[3.25rem] px-7 py-3.5 text-base",
};

export function Button({
  children,
  className = "",
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
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-bold transition duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
