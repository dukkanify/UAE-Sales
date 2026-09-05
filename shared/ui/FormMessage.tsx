import type { ReactNode } from "react";
import { Copy } from "@/shared/i18n/LocalizedTree";

type FormMessageProps = {
  children: ReactNode;
  variant: "error" | "success";
};

export function FormMessage({ children, variant }: FormMessageProps) {
  const styles =
    variant === "error"
      ? "border-error/15 bg-error-soft text-error"
      : "border-success/15 bg-success-soft text-success";

  return (
    <p
      className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium ${styles}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {typeof children === "string" ? <Copy text={children} /> : children}
    </p>
  );
}
