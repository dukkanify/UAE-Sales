import type { Listing } from "@/types";
import { getListingImageUrl } from "@/features/listings/components/listing-card.utils";

/** Preferred showcase slugs for the app-download phone mockup. */
export const APP_PREVIEW_LISTING_SLUGS = [
  "mercedes-amg-g63-2024",
  "iphone-16-pro-max-256gb",
  "toyota-land-cruiser-2023",
  "samsung-galaxy-s25-ultra",
  "bmw-x7-2023",
  "apartment-downtown-dubai",
] as const;

export function getAppPreviewImageUrl(listing: Listing): string | undefined {
  return getListingImageUrl(listing);
}

function hasCover(listing: Listing): boolean {
  return Boolean(getListingImageUrl(listing));
}

/** Ranked catalog cards for the phone screen — real covers only, no mock fallback. */
export function resolveAppPreviewListings(listings: Listing[]): Listing[] {
  const seen = new Set<string>();
  const picked: Listing[] = [];

  const take = (listing?: Listing) => {
    if (!listing || seen.has(listing.id) || !hasCover(listing)) return;
    seen.add(listing.id);
    picked.push(listing);
  };

  const bySlug = new Map(listings.map((listing) => [listing.slug, listing]));
  for (const slug of APP_PREVIEW_LISTING_SLUGS) {
    take(bySlug.get(slug));
  }
  for (const listing of listings) {
    if (picked.length >= 6) break;
    take(listing);
  }
  return picked;
}
