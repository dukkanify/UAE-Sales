import { imagesForSlug } from "@/mock/listing-images.mock";
import { getCategoryFallbackUrl } from "@/shared/constants/image-fallbacks";
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

/** Canonical gallery for mock listings — slug map wins over stale embedded URLs. */
export function getListingImages(listing: Listing): string[] {
  if (listing.id.startsWith("local-")) {
    if (listing.images?.length) {
      return listing.images;
    }
    if (listing.imageUrl) {
      return [listing.imageUrl];
    }
    return [];
  }

  const curated = imagesForSlug(listing.slug);
  if (curated.length > 0) {
    return curated;
  }

  if (listing.images?.length) {
    return listing.images;
  }
  if (listing.imageUrl) {
    return [listing.imageUrl];
  }

  return [getCategoryFallbackUrl(listing.categoryId)];
}

/** Resize Unsplash sources for cards/thumbs; leave data URLs and other hosts intact. */
export function withImageWidth(url: string, width: number): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (!url.includes("images.unsplash.com")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    if (!parsed.searchParams.get("q")) {
      parsed.searchParams.set("q", width <= 400 ? "68" : "72");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getListingImageUrl(listing: Listing, width = 640): string {
  return withImageWidth(getListingImages(listing)[0] ?? "", width);
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
