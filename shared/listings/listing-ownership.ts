import type { Listing, UserProfile } from "@/types";
import { getLocalListingsForSeller } from "@/services/storage";

export function isOwnListing(listing: Listing, user: UserProfile): boolean {
  if (user.id === listing.seller.id) {
    return true;
  }

  return getLocalListingsForSeller(user.id).some((item) => item.id === listing.id);
}

export function getCheckoutListingParam(listing: Listing): string {
  return listing.id.startsWith("local-") ? listing.id : listing.slug;
}

export function listingMatchesEmirate(listing: Listing, emirate: string): boolean {
  if (!emirate) {
    return true;
  }
  return (
    listing.emirate === emirate ||
    listing.city === emirate ||
    listing.categorySpecs?.emirate === emirate ||
    listing.categorySpecs?.city === emirate
  );
}
