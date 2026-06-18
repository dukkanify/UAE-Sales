import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-white/75 bg-white/90 shadow-[var(--shadow-card)] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
