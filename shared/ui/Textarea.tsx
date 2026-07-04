import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ className = "", label, ...props }: TextareaProps) {
  return (
    <label className="grid gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-ink">{label}</span>
      ) : null}
      <textarea
        className={`focus-ring min-h-32 rounded-[var(--radius-xl)] border border-border bg-surface px-4 py-3 text-sm font-medium text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/70 ${className}`}
        {...props}
      />
    </label>
  );
}
