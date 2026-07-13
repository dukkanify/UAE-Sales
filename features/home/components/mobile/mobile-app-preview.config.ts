import type { Listing } from "@/types";
import { imagesForSlug } from "@/mock/listing-images.mock";

/** Fixed showcase slugs for the app-download phone mockup */
export const APP_PREVIEW_LISTING_SLUGS = [
  "mercedes-amg-g63-2024",
  "toyota-land-cruiser-2023",
] as const;

export function getAppPreviewImageUrl(slug: string, fallback: string): string {
  return imagesForSlug(slug)[0] ?? fallback;
}

export function resolveAppPreviewListings(listings: Listing[]): Listing[] {
  const bySlug = new Map(listings.map((listing) => [listing.slug, listing]));

  return APP_PREVIEW_LISTING_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (listing): listing is Listing => Boolean(listing),
  );
}
