import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-secondary text-primary shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-primary hover:text-white",
  secondary:
    "border border-secondary/45 bg-white/90 text-primary shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-secondary hover:text-primary",
  ghost: "text-muted hover:bg-secondary-soft hover:text-primary",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const content = children ?? "إجراء";

  return (
    <button
      className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-black transition duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
