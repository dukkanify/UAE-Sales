"use client";

import { useRef, type InputHTMLAttributes, type MouseEvent } from "react";

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
  onClick,
  type,
  ...props
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = Boolean(error);
  const isPickerType = type === "date" || type === "time";

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;

    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  }

  function handleLabelClick(event: MouseEvent<HTMLLabelElement>) {
    if (!isPickerType || event.target === inputRef.current) return;

    event.preventDefault();
    openPicker();
  }

  function handleInputClick(event: MouseEvent<HTMLInputElement>) {
    if (isPickerType) {
      openPicker();
    }

    onClick?.(event);
  }

  return (
    <label
      className={`grid ${compact ? "gap-1" : "gap-1.5"} ${isPickerType ? "cursor-pointer" : ""}`}
      onClick={handleLabelClick}
    >
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
        ref={inputRef}
        aria-invalid={hasError || undefined}
        className={`focus-ring rounded-[var(--radius-xl)] border bg-surface text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/60 transition ${compact ? "min-h-9 rounded-lg px-3 text-xs font-medium" : "min-h-11 px-4 text-sm font-medium"} ${hasError ? "border-error bg-error-soft/30" : "border-border"} ${isPickerType ? "cursor-pointer" : ""} ${className}`}
        onClick={handleInputClick}
        type={type}
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
