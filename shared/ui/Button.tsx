import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Icon } from "@/shared/ui/Icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  fullWidth?: boolean;
  href?: string;
  loading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
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
  disabled,
  fullWidth = false,
  href,
  loading = false,
  onClick,
  size = "md",
  variant = "accent",
  ...props
}: ButtonProps) {
  const content =
    typeof children === "string" && children.trim().length === 0
      ? "إجراء"
      : (children ?? "إجراء");

  const isDisabled = disabled || loading;

  const classes = `focus-ring interactive-lift inline-flex items-center justify-center gap-2 rounded-[var(--radius-xl)] font-semibold transition duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${isDisabled ? "pointer-events-none opacity-60" : ""} ${className}`;

  const inner = (
    <>
      {loading ? <Icon className="animate-spin" name="clock" size={16} /> : null}
      {content}
    </>
  );

  if (href && !loading) {
    return (
      <Link aria-busy={loading} className={classes} href={href} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      aria-busy={loading}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {inner}
    </button>
  );
}
