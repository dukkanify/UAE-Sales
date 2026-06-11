import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-l from-primary via-emerald-500 to-primary-dark text-white shadow-[var(--shadow-glow)] hover:-translate-y-0.5 hover:brightness-105",
  secondary:
    "border border-border bg-white/85 text-ink shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-primary hover:text-primary",
  ghost: "text-muted hover:bg-white/75 hover:text-primary",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-black transition duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
