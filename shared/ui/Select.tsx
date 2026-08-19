"use client";

import type { SelectHTMLAttributes } from "react";
import { useTx } from "@/shared/i18n/useTx";

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
  const t = useTx();
  const hasError = Boolean(error);
  const translatedLabel = t(label);
  const translatedError = error ? t(error) : error;

  return (
    <label className={`grid min-w-0 ${compact ? "gap-1" : "gap-1.5"}`}>
      <span
        className={
          compact ? "text-xs font-semibold text-muted" : "text-sm font-medium text-ink"
        }
      >
        {translatedLabel}
      </span>
      <select
        aria-invalid={hasError || undefined}
        className={`focus-ring w-full min-w-0 rounded-[var(--radius-xl)] border bg-surface text-ink shadow-[var(--shadow-xs)] transition ${compact ? "min-h-9 rounded-lg px-3 text-xs font-medium" : "min-h-11 px-4 text-sm font-medium"} ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      {translatedError ? (
        <span className="text-xs font-medium text-error" role="alert">
          {translatedError}
        </span>
      ) : null}
    </label>
  );
}
