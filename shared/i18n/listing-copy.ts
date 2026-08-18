import type { Listing } from "@/types";
import type { AppLocale } from "./locale";

export function listingTitle(
  listing: Pick<Listing, "title" | "titleEnglish">,
  locale: AppLocale,
): string {
  if (locale === "en") {
    return listing.titleEnglish?.trim() || listing.title;
  }
  return listing.title;
}

export function listingDescription(
  listing: Pick<Listing, "description" | "descriptionEnglish">,
  locale: AppLocale,
): string {
  if (locale === "en") {
    return listing.descriptionEnglish?.trim() || listing.description;
  }
  return listing.description;
}
