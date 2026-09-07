import type { Listing } from "@/types";

export type ListingCardBadgeKey = "featured" | "verified" | "new";

export type ListingCardBadge = {
  key: ListingCardBadgeKey;
  label: string;
  variant: ListingCardBadgeKey;
};

/** Featured only when DB flag is set and not past featuredUntil. */
export function isListingFeaturedActive(listing: Listing, nowMs = Date.now()): boolean {
  if (listing.isFeatured !== true) return false;
  if (!listing.featuredUntil) return true;
  const until = Date.parse(listing.featuredUntil);
  if (Number.isNaN(until)) return true;
  return until > nowMs;
}

/** Verified only from explicit verification flags — never invent from rating. */
export function isListingVerified(listing: Listing): boolean {
  return Boolean(listing.verifiedSeller ?? listing.seller.isVerified);
}

export function isListingFresh(listing: Listing): boolean {
  // Only use stable listing fields — Date.now() age checks cause SSR/client hydration mismatches.
  return listing.condition === "new";
}

/** Colored classification badges for listing cards — max 3 for clarity. */
export function getListingCardBadges(listing: Listing): ListingCardBadge[] {
  const badges: ListingCardBadge[] = [];

  if (isListingFeaturedActive(listing)) {
    badges.push({ key: "featured", label: "مميز", variant: "featured" });
  }
  if (isListingVerified(listing)) {
    badges.push({ key: "verified", label: "موثق", variant: "verified" });
  }
  if (isListingFresh(listing)) {
    badges.push({ key: "new", label: "جديد", variant: "new" });
  }

  return badges.slice(0, 3);
}
