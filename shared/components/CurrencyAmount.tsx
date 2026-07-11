"use client";

import { formatCurrencyDisplay } from "@/shared/utils/currency";

type CurrencyAmountSize = "sm" | "md" | "lg" | "xl";

type CurrencyAmountProps = {
  amount: number;
  className?: string;
  locale?: "ar-AE" | "en-AE";
  size?: CurrencyAmountSize;
  showSign?: boolean;
};

const sizeClasses: Record<CurrencyAmountSize, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-bold",
  lg: "text-2xl font-bold",
  xl: "text-3xl font-black",
};

export function CurrencyAmount({
  amount,
  className = "",
  locale = "ar-AE",
  size = "md",
  showSign = false,
}: CurrencyAmountProps) {
  const formatted = formatCurrencyDisplay(amount, locale);
  const sign = showSign && amount > 0 ? "+" : showSign && amount < 0 ? "" : "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-ink ${className}`}
      dir="ltr"
    >
      <span className={sizeClasses[size]}>
        {sign}
        {formatted}
      </span>
    </span>
  );
}
