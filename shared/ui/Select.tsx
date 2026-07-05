import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  label: string;
  options: SelectOption[];
};

export function Select({
  className = "",
  error,
  label,
  options,
  ...props
}: SelectProps) {
  const hasError = Boolean(error);

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        aria-invalid={hasError || undefined}
        className={`focus-ring min-h-11 rounded-[var(--radius-xl)] border bg-surface px-4 text-sm font-medium text-ink shadow-[var(--shadow-xs)] transition ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${className}`}
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
