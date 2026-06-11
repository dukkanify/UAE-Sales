import type { HTMLAttributes, ReactNode } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
