import type { AppLocale } from "./locale";

function formatCount(count: number, locale: AppLocale): string {
  return count.toLocaleString(locale === "en" ? "en-AE" : "ar-AE", {
    numberingSystem: "latn",
  });
}

/** Single text node — avoids LiveLocalizer turning "{n} إعلان" into "6Listing". */
export function listingCountLabel(count: number, locale: AppLocale): string {
  const n = formatCount(count, locale);
  if (locale === "en") {
    return count === 1 ? `${n} listing` : `${n} listings`;
  }
  return `${n} إعلان`;
}

export function activeListingCountLabel(
  count: number,
  locale: AppLocale,
): string {
  const n = formatCount(count, locale);
  if (locale === "en") {
    return count === 1
      ? `${n} active listing in this category`
      : `${n} active listings in this category`;
  }
  return `${n} إعلان نشط في هذا القسم`;
}

export function resultsCountLabel(count: number, locale: AppLocale): string {
  const n = formatCount(count, locale);
  if (locale === "en") {
    return count === 1 ? `${n} result` : `${n} results`;
  }
  return `${n} نتيجة`;
}

export function uaeActiveListingsLabel(
  count: number,
  locale: AppLocale,
): string {
  const n = formatCount(count, locale);
  if (locale === "en") {
    return `${n} active listings across the UAE`;
  }
  return `${n} إعلان نشط في الإمارات`;
}
