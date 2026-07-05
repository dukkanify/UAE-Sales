import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  hint?: string;
  label?: string;
};

export function Textarea({
  className = "",
  error,
  hint,
  label,
  ...props
}: TextareaProps) {
  const hasError = Boolean(error);

  return (
    <label className="grid gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-ink">{label}</span>
      ) : null}
      <textarea
        aria-invalid={hasError || undefined}
        className={`focus-ring min-h-32 rounded-[var(--radius-xl)] border bg-surface px-4 py-3 text-sm font-medium text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/70 transition ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${className}`}
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
