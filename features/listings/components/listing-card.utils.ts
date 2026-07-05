import type { Listing } from "@/types";

export const listingPriceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
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

export function getListingImageUrl(listing: Listing): string {
  return listing.images?.[0] ?? listing.imageUrl ?? "";
}

export const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};
