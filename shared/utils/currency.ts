const formatterAr = new Intl.NumberFormat("ar-AE", { maximumFractionDigits: 0 });
const formatterEn = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

export function formatCurrencyAmount(
  amount: number,
  locale: "ar-AE" | "en-AE" = "ar-AE",
): string {
  return locale === "en-AE" ? formatterEn.format(amount) : formatterAr.format(amount);
}

/** Plain-text currency label for notifications and activity strings */
export function formatCurrencyLabel(
  amount: number,
  locale: "ar-AE" | "en-AE" = "ar-AE",
): string {
  return `${formatCurrencyAmount(amount, locale)} درهم`;
}
