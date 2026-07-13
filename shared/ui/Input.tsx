import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
  error?: string;
  hint?: string;
  label?: string;
};

export function Input({
  className = "",
  compact = false,
  error,
  hint,
  label,
  ...props
}: InputProps) {
  const hasError = Boolean(error);

  return (
    <label className={`grid ${compact ? "gap-1" : "gap-1.5"}`}>
      {label ? (
        <span
          className={
            compact
              ? "text-xs font-semibold text-muted"
              : "text-sm font-medium text-ink"
          }
        >
          {label}
        </span>
      ) : null}
      <input
        aria-invalid={hasError || undefined}
        className={`focus-ring rounded-[var(--radius-xl)] border bg-surface text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/60 transition ${compact ? "min-h-9 rounded-lg px-3 text-xs font-medium" : "min-h-11 px-4 text-sm font-medium"} ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${className}`}
        {...props}
      />
      {error ? (
        <span className="text-xs font-medium text-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs font-medium text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
