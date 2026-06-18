import type { HTMLAttributes, ReactNode } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-secondary/30 bg-secondary-soft px-3.5 py-1.5 text-xs font-black text-primary shadow-sm ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
