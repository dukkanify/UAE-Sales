import { demoAccounts } from "@/mock/demo-accounts.mock";
import type { Listing, UserProfile } from "@/types";
import { getLocalListingsForSeller } from "@/services/storage";

function isDemoSessionUser(user: UserProfile): boolean {
  return demoAccounts.some(
    (account) =>
      account.profile.id === user.id || account.profile.email === user.email,
  );
}

export function isOwnListing(listing: Listing, user: UserProfile): boolean {
  if (user.id === listing.seller.id) {
    return true;
  }

  const ownsLocal = getLocalListingsForSeller(user.id).some(
    (item) => item.id === listing.id,
  );
  if (ownsLocal) {
    return true;
  }

  if (isDemoSessionUser(user) && listing.id.startsWith("user-listing-")) {
    return true;
  }

  return false;
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
