import type { Listing } from "@/types";
import {
  getAllListings,
  getListingSync,
} from "@/services/listings/listing-store";

export type ListingSnapshot = {
  id: string;
  slug?: string;
  title: string;
  price: number;
  categoryId?: string;
  emirate?: string;
  city?: string;
  seller: {
    id: string;
    name: string;
  };
};

export function getServerListingById(listingId: string): Listing | undefined {
  return getListingSync(listingId);
}

export function getServerListingBySlug(slug: string): Listing | undefined {
  return getListingSync(slug);
}

export async function hydrateListingCatalog(): Promise<void> {
  await getAllListings();
}

export function toListingSnapshot(listing: Listing): ListingSnapshot {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    categoryId: listing.categoryId,
    emirate: listing.emirate,
    city: listing.city,
    seller: {
      id: listing.seller.id,
      name: listing.seller.name,
    },
  };
}

export function validateLocalListingSnapshot(
  snapshot: ListingSnapshot,
): boolean {
  return (
    snapshot.id.startsWith("local-") &&
    snapshot.title.trim().length > 0 &&
    Number.isFinite(snapshot.price) &&
    snapshot.price > 0 &&
    snapshot.seller.id.trim().length > 0
  );
}
