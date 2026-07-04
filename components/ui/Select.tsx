import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

export function Select({
  className = "",
  label,
  options,
  ...props
}: SelectProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-ink">{label}</span>
      <select
        className={`focus-ring min-h-11 rounded-[var(--radius-md)] border border-border bg-surface px-4 text-sm font-medium text-ink shadow-[var(--shadow-xs)] ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
