import type { Listing } from "@/types";
import { marketplaceListings } from "@/mock/listings.mock";
import { imagesForSlug } from "@/mock/listing-images.mock";

/** Preferred showcase slugs for the app-download phone mockup. */
export const APP_PREVIEW_LISTING_SLUGS = [
  "mercedes-amg-g63-2024",
  "iphone-16-pro-max-256gb",
  "toyota-land-cruiser-2023",
  "samsung-galaxy-s25-ultra",
  "bmw-x7-2023",
  "apartment-downtown-dubai",
] as const;

export function getAppPreviewImageUrl(slug: string, fallback: string): string {
  return imagesForSlug(slug)[0] ?? fallback;
}

function hasCover(listing: Listing): boolean {
  return Boolean(listing.images?.[0] || listing.imageUrl);
}

/** Ranked catalog cards for the phone screen — never depends on a single slug. */
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
  if (picked.length < 3) {
    for (const listing of marketplaceListings) {
      if (picked.length >= 6) break;
      take(listing);
    }
  }
  return picked;
}
