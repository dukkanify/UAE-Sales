import type { Listing } from "@/types";
import { getAppUrl } from "@/shared/constants/site";

export function getListingPath(listing: Listing): string {
  return listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;
}

export function getListingCanonicalUrl(listing: Listing): string {
  return `${getAppUrl()}${getListingPath(listing)}`;
}

export function getCheckoutPath(listing: Listing): string {
  const listingId = listing.id.startsWith("local-") ? listing.id : listing.slug;
  return `/checkout?listingId=${encodeURIComponent(listingId)}`;
}
