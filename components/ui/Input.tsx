import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className = "", label, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-black text-ink">
      {label ? <span>{label}</span> : null}
      <input
        className={`focus-ring min-h-[3.25rem] rounded-2xl border border-border bg-white/90 px-4 text-sm font-bold text-ink shadow-sm placeholder:text-muted ${className}`}
        {...props}
      />
    </label>
  );
}
