import { mockListings, mockUserListings } from "@/mock";
import type { Listing } from "@/types";

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
  return [...mockListings, ...mockUserListings].find(
    (listing) => listing.id === listingId || listing.slug === listingId,
  );
}

export function getServerListingBySlug(slug: string): Listing | undefined {
  return [...mockListings, ...mockUserListings].find(
    (listing) => listing.slug === slug,
  );
}

export function toListingSnapshot(listing: Listing): ListingSnapshot {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
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
