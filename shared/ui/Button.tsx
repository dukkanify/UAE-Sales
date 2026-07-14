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

/** Filled brand CTA — gold. `primary` and `accent` stay aliased for call-site compatibility. */
const GOLD_CTA =
  "sooqna-gold-gradient border border-transparent text-primary shadow-[0_8px_24px_rgb(201_169_98/28%)] hover:brightness-[1.03] active:brightness-[0.98]";

const variantClasses: Record<ButtonVariant, string> = {
  primary: GOLD_CTA,
  accent: GOLD_CTA,
  secondary:
    "border border-secondary/45 bg-secondary-soft/70 text-primary shadow-[var(--shadow-xs)] hover:border-secondary hover:bg-secondary-soft",
  ghost: "text-muted hover:bg-secondary-soft/60 hover:text-primary",
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

  const classes = `focus-ring interactive-lift inline-flex items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-xl)] font-semibold transition duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${isDisabled ? "pointer-events-none opacity-60" : ""} ${className}`;

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
