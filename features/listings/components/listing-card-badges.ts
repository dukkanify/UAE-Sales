import type { Listing } from "@/types";

export type ListingCardBadgeKey = "urgent" | "featured" | "verified" | "new";

export type ListingCardBadge = {
  key: ListingCardBadgeKey;
  label: string;
  variant: ListingCardBadgeKey;
};

const FRESH_LISTING_DAYS = 7;

export function isListingVerified(listing: Listing): boolean {
  return Boolean(
    listing.verifiedSeller ??
      listing.seller.isVerified ??
      (listing.seller.rating ?? 0) >= 4.8,
  );
}

export function isListingFresh(listing: Listing): boolean {
  if (listing.condition === "new") return true;
  if (!listing.postedAt) return false;

  const posted = new Date(listing.postedAt).getTime();
  if (Number.isNaN(posted)) return false;

  const ageMs = Date.now() - posted;
  return ageMs >= 0 && ageMs <= FRESH_LISTING_DAYS * 24 * 60 * 60 * 1000;
}

export function isListingUrgent(listing: Listing): boolean {
  if (listing.isUrgent === true) return true;
  if (listing.features?.some((feature) => /عاجل|urgent/i.test(feature))) {
    return true;
  }
  // Demo catalog fallback when persisted rows predate isUrgent.
  const idNum = Number(listing.id.replace(/\D/g, "").slice(-3)) || 0;
  return listing.isFeatured === true && idNum % 5 === 1;
}

/** Colored classification badges for listing cards — max 3 for clarity. */
export function getListingCardBadges(listing: Listing): ListingCardBadge[] {
  const badges: ListingCardBadge[] = [];

  if (isListingUrgent(listing)) {
    badges.push({ key: "urgent", label: "عاجل", variant: "urgent" });
  }
  if (listing.isFeatured) {
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
