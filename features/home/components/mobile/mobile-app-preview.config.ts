import type { Listing } from "@/types";
import { unsplashUrl } from "@/shared/constants/image-fallbacks";

/** Fixed showcase slugs for the app-download phone mockup */
export const APP_PREVIEW_LISTING_SLUGS = [
  "mercedes-amg-g63-2024",
  "toyota-land-cruiser-2023",
] as const;

/**
 * Curated photos that match listing titles in the small device preview.
 * Global listing pools can rotate generic stock images — overrides keep the mock accurate.
 */
export const APP_PREVIEW_IMAGE_OVERRIDES: Record<string, string> = {
  "mercedes-amg-g63-2024": unsplashUrl("photo-1617531653332-bd46c24f2068", 900),
  "toyota-land-cruiser-2023": unsplashUrl("photo-1549317661-bd32c8ce0db2", 900),
  "nissan-patrol-platinum-2022": unsplashUrl("photo-1533473359331-0135ef1b58bf", 900),
  "villa-palm-jumeirah": unsplashUrl("photo-1600585154340-be6161a56a0c", 900),
  "iphone-16-pro-max-256gb": unsplashUrl("photo-1592750475338-74b7b21085ab", 900),
};

export function getAppPreviewImageUrl(slug: string, fallback: string): string {
  return APP_PREVIEW_IMAGE_OVERRIDES[slug] ?? fallback;
}

export function resolveAppPreviewListings(listings: Listing[]): Listing[] {
  const bySlug = new Map(listings.map((listing) => [listing.slug, listing]));

  return APP_PREVIEW_LISTING_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (listing): listing is Listing => Boolean(listing),
  );
}
