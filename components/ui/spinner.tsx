import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

function Spinner({ className, label = "Loading", size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
    >
      <Loader2 className={cn("animate-spin text-accent", sizes[size])} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
