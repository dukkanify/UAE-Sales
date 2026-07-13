import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  compact?: boolean;
  error?: string;
  label: string;
  options: SelectOption[];
};

export function Select({
  className = "",
  compact = false,
  error,
  label,
  options,
  ...props
}: SelectProps) {
  const hasError = Boolean(error);

  return (
    <label className={`grid min-w-0 ${compact ? "gap-1" : "gap-1.5"}`}>
      <span
        className={
          compact ? "text-xs font-semibold text-muted" : "text-sm font-medium text-ink"
        }
      >
        {label}
      </span>
      <select
        aria-invalid={hasError || undefined}
        className={`focus-ring w-full min-w-0 rounded-[var(--radius-xl)] border bg-surface text-ink shadow-[var(--shadow-xs)] transition ${compact ? "min-h-9 rounded-lg px-3 text-xs font-medium" : "min-h-11 px-4 text-sm font-medium"} ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs font-medium text-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
