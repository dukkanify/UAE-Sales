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
    <label className="grid gap-2 text-sm font-black text-ink">
      <span>{label}</span>
      <select
        className={`focus-ring min-h-[3.25rem] rounded-2xl border border-border bg-white/90 px-4 text-sm font-bold text-ink shadow-sm ${className}`}
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
