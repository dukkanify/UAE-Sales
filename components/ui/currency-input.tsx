"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  currency?: string;
  value?: string | number;
  onValueChange?: (value: string) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, currency = "KWD", value, onValueChange, ...props }, ref) => (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
        {currency}
      </span>
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        className={cn("rounded-xl pl-14", className)}
        value={value ?? ""}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d.]/g, "");
          onValueChange?.(next);
        }}
        {...props}
      />
    </div>
  ),
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
