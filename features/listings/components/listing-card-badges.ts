import type { Listing } from "@/types";
import { listingShowsItemCondition } from "@/shared/listings/listing-condition";

export type ListingCardBadgeKey = "urgent" | "featured" | "verified" | "new";

export type ListingCardBadge = {
  key: ListingCardBadgeKey;
  label: string;
  variant: ListingCardBadgeKey;
};

export function isListingVerified(listing: Listing): boolean {
  return Boolean(
    listing.verifiedSeller ??
      listing.seller.isVerified ??
      (listing.seller.rating ?? 0) >= 4.8,
  );
}

export function isListingFresh(listing: Listing): boolean {
  return listingShowsItemCondition(listing) && listing.condition === "new";
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
