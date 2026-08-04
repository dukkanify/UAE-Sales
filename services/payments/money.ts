/**
 * Money helpers — minor units formatting.
 */

export function formatMinor(amount: number, currency = "KWD"): string {
  const digits = currency === "KWD" || currency === "BHD" || currency === "OMR" ? 3 : 2;
  const major = amount / 10 ** digits;
  return new Intl.NumberFormat("en-KW", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(major);
}

export function majorToMinor(major: number, currency = "KWD"): number {
  const digits = currency === "KWD" || currency === "BHD" || currency === "OMR" ? 3 : 2;
  return Math.round(major * 10 ** digits);
}

export function calcTax(subtotalAfterDiscount: number, taxRatePercent: number): number {
  return Math.round((subtotalAfterDiscount * taxRatePercent) / 100);
}

export function calcPlatformFee(gross: number, feePercent: number): number {
  return Math.round((gross * feePercent) / 100);
}
