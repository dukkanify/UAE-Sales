"use client";

import Image from "next/image";
import { useState } from "react";

type CurrencyAmountSize = "sm" | "md" | "lg" | "xl";

type CurrencyAmountProps = {
  amount: number;
  className?: string;
  locale?: "ar-AE" | "en-AE";
  size?: CurrencyAmountSize;
  showSign?: boolean;
};

const sizeClasses: Record<CurrencyAmountSize, { amount: string; symbol: string }> = {
  sm: { amount: "text-sm font-semibold", symbol: "size-3.5" },
  md: { amount: "text-base font-bold", symbol: "size-4" },
  lg: { amount: "text-2xl font-bold", symbol: "size-5" },
  xl: { amount: "text-3xl font-black", symbol: "size-6" },
};

const formatterAr = new Intl.NumberFormat("ar-AE", { maximumFractionDigits: 0 });
const formatterEn = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

export function CurrencyAmount({
  amount,
  className = "",
  locale = "ar-AE",
  size = "md",
  showSign = false,
}: CurrencyAmountProps) {
  const [symbolFailed, setSymbolFailed] = useState(false);
  const formatted =
    locale === "en-AE" ? formatterEn.format(amount) : formatterAr.format(amount);
  const sign = showSign && amount > 0 ? "+" : showSign && amount < 0 ? "" : "";
  const styles = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-ink ${className}`}
      dir="ltr"
    >
      <span className={styles.amount}>
        {sign}
        {formatted}
      </span>
      {symbolFailed ? (
        <span className="text-xs font-semibold text-muted">AED</span>
      ) : (
        <Image
          alt=""
          aria-hidden
          className={`${styles.symbol} shrink-0 text-accent`}
          height={24}
          onError={() => setSymbolFailed(true)}
          src="/brand/dirham.svg"
          width={24}
        />
      )}
    </span>
  );
}
