/** Client-safe money helpers (fils / minor units). */

export function formatMinor(amount: number, currency = "KWD"): string {
  const digits = currency === "KWD" || currency === "BHD" || currency === "OMR" ? 3 : 2;
  const major = amount / 10 ** digits;
  try {
    return new Intl.NumberFormat("en-KW", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(major);
  } catch {
    return `${major.toFixed(digits)} ${currency}`;
  }
}
