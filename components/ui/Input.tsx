import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hint?: string;
  label?: string;
};

export function Input({ className = "", hint, label, ...props }: InputProps) {
  return (
    <label className="grid gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-ink">{label}</span>
      ) : null}
      <input
        className={`focus-ring min-h-11 rounded-[var(--radius-xl)] border border-border bg-surface px-4 text-sm font-medium text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/60 ${className}`}
        {...props}
      />
      {hint ? (
        <span className="text-xs font-medium text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
