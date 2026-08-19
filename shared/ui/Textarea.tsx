"use client";

import type { TextareaHTMLAttributes } from "react";
import { useTx } from "@/shared/i18n/useTx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  compact?: boolean;
  error?: string;
  hint?: string;
  label?: string;
};

export function Textarea({
  className = "",
  compact = false,
  error,
  hint,
  label,
  placeholder,
  ...props
}: TextareaProps) {
  const t = useTx();
  const hasError = Boolean(error);
  const translatedLabel = label ? t(label) : label;
  const translatedError = error ? t(error) : error;
  const translatedHint = hint ? t(hint) : hint;
  const translatedPlaceholder =
    typeof placeholder === "string" ? t(placeholder) : placeholder;

  return (
    <label className={`grid min-w-0 ${compact ? "gap-1" : "gap-1.5"}`}>
      {label ? (
        <span
          className={
            compact ? "text-xs font-semibold text-muted" : "text-sm font-medium text-ink"
          }
        >
          {translatedLabel}
        </span>
      ) : null}
      <textarea
        aria-invalid={hasError || undefined}
        className={`focus-ring w-full min-w-0 rounded-[var(--radius-xl)] border bg-surface text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/70 transition ${compact ? "min-h-24 rounded-lg px-3 py-2 text-xs font-medium" : "min-h-32 px-4 py-3 text-sm font-medium"} ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${className}`}
        placeholder={translatedPlaceholder}
        {...props}
      />
      {translatedError ? (
        <span className="text-xs font-medium text-error" role="alert">
          {translatedError}
        </span>
      ) : translatedHint ? (
        <span className="text-xs font-medium text-muted">{translatedHint}</span>
      ) : null}
    </label>
  );
}
