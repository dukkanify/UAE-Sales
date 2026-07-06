import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Icon } from "@/shared/ui/Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "gold"
  | "accent";

export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonShape = "rounded" | "pill";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children?: ReactNode;
  fullWidth?: boolean;
  href?: string;
  iconOnly?: boolean;
  loading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  shape?: ButtonShape;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-xs)] hover:brightness-110 active:brightness-95",
  secondary:
    "border border-border bg-surface text-ink shadow-[var(--shadow-xs)] hover:border-secondary/50 hover:bg-surface-muted active:bg-surface-muted",
  outline:
    "border border-border bg-transparent text-ink hover:bg-surface-muted active:bg-surface-muted",
  ghost:
    "bg-transparent text-muted hover:bg-surface-muted hover:text-ink active:bg-surface-muted",
  danger:
    "bg-error text-white shadow-[var(--shadow-xs)] hover:brightness-110 active:brightness-95",
  success:
    "bg-success text-white shadow-[var(--shadow-xs)] hover:brightness-110 active:brightness-95",
  gold:
    "uae-gold-gradient text-white shadow-[0_6px_20px_rgb(184_149_95/30%)] hover:brightness-105 active:brightness-95",
  accent:
    "uae-gold-gradient text-white shadow-[0_6px_20px_rgb(184_149_95/30%)] hover:brightness-105 active:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 min-h-9 px-[14px] text-xs gap-1.5",
  md: "h-[42px] min-h-[42px] px-[18px] text-sm gap-2",
  lg: "h-[50px] min-h-[50px] px-6 text-base gap-2",
  xl: "h-[58px] min-h-[58px] px-[30px] text-base gap-2.5",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "size-9 min-h-9 min-w-9 p-0",
  md: "size-[42px] min-h-[42px] min-w-[42px] p-0",
  lg: "size-[50px] min-h-[50px] min-w-[50px] p-0",
  xl: "size-[58px] min-h-[58px] min-w-[58px] p-0",
};

const shapeClasses: Record<ButtonShape, string> = {
  rounded: "rounded-[var(--radius-xl)]",
  pill: "rounded-full",
};

function resolveVariant(variant: ButtonVariant): ButtonVariant {
  return variant === "accent" ? "gold" : variant;
}

export function Button({
  children,
  className = "",
  disabled,
  fullWidth = false,
  href,
  iconOnly = false,
  loading = false,
  onClick,
  shape = "rounded",
  size = "md",
  variant = "primary",
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const resolvedVariant = resolveVariant(variant);
  const isDisabled = disabled || loading;
  const hasVisibleLabel =
    typeof children === "string"
      ? children.trim().length > 0
      : children !== undefined && children !== null && children !== false;

  if (iconOnly && !ariaLabel && !hasVisibleLabel) {
    console.warn("[Button] iconOnly buttons require aria-label.");
  }

  const labelContent =
    typeof children === "string" && children.trim().length === 0
      ? "إجراء"
      : children;

  const classes = [
    "focus-ring interactive-lift inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap overflow-visible transition duration-200",
    variantClasses[resolvedVariant],
    iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
    shapeClasses[shape],
    fullWidth ? "w-full" : "",
    isDisabled ? "pointer-events-none opacity-60" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {loading ? (
        <Icon aria-hidden className="shrink-0 animate-spin" name="clock" size={16} />
      ) : null}
      {labelContent}
    </>
  );

  if (href && !loading && !isDisabled) {
    return (
      <Link
        aria-busy={loading}
        aria-label={ariaLabel}
        className={classes}
        href={href}
        onClick={onClick}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      aria-busy={loading}
      aria-label={ariaLabel}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {inner}
    </button>
  );
}
