import type { Listing } from "@/types";

export const listingPriceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
  numberingSystem: "latn",
});

export function getListingHref(listing: Listing): string {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

export function getListingLocation(listing: Listing): string {
  if (listing.area) {
    return `${listing.area}، ${listing.emirate ?? listing.city}`;
  }
  return listing.emirate ?? listing.city;
}

/**
 * Real listing media only — never substitute Unsplash/stock as seller photos.
 * Empty array means the UI should show a neutral "no image" state.
 */
export function getListingImages(listing: Listing): string[] {
  const fromGallery = (listing.images ?? [])
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url));
  if (fromGallery.length > 0) {
    return fromGallery;
  }
  const cover = listing.imageUrl?.trim();
  return cover ? [cover] : [];
}

export function getListingImageUrl(listing: Listing): string | undefined {
  return getListingImages(listing)[0];
}

export const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export const conditionBadgeVariant: Record<
  Listing["condition"],
  "new" | "muted" | "premium"
> = {
  excellent: "premium",
  new: "new",
  used: "muted",
};

export function formatPostedTime(postedAt?: string): string {
  if (!postedAt) {
    return "—";
  }

  const posted = new Date(postedAt);
  if (Number.isNaN(posted.getTime())) {
    return "—";
  }

  // Deterministic calendar label — avoid Date.now()/relative time (SSR hydration mismatch).
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ] as const;

  return `${posted.getUTCDate()} ${months[posted.getUTCMonth()]}`;
}

export function formatViews(views: number): string {
  return new Intl.NumberFormat("ar-AE", { numberingSystem: "latn" }).format(
    views,
  );
}
