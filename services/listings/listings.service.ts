import type { Listing, ListingSearchFilters } from "@/types";
import { listingMatchesQuery } from "@/shared/listings/listing-specs";
import {
  getAllListings,
  getListingBySlug as getStoredListingBySlug,
} from "@/services/listings/listing-store";

export type { ListingSearchFilters };

export async function getListings(): Promise<Listing[]> {
  return getAllListings();
}

export async function getMyListings(userId?: string): Promise<Listing[]> {
  const listings = await getAllListings();
  if (!userId) return listings.filter((listing) => listing.id.startsWith("local-"));
  return listings.filter((listing) => listing.seller.id === userId);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  return getStoredListingBySlug(slug);
}

export async function getFeaturedListings(): Promise<Listing[]> {
  const listings = await getAllListings();
  return listings.filter((listing) => listing.isFeatured && listing.status === "active");
}

export async function getRelatedListings(
  categoryId: string,
  excludedId: string,
): Promise<Listing[]> {
  const listings = await getAllListings();
  return listings
    .filter((listing) => listing.status === "active")
    .filter((listing) => listing.categoryId === categoryId)
    .filter((listing) => listing.id !== excludedId)
    .slice(0, 3);
}

function matchesQuery(listing: Listing, query: string): boolean {
  return listingMatchesQuery(listing, query);
}

export async function searchListings(
  filters: ListingSearchFilters = {},
): Promise<Listing[]> {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const emirateFilter = filters.emirate ?? filters.city;
  const listings = await getAllListings();

  const results = listings
    .filter((listing) => listing.status === "active")
    .filter((listing) =>
      normalizedQuery ? matchesQuery(listing, normalizedQuery) : true,
    )
    .filter((listing) =>
      filters.categoryId ? listing.categoryId === filters.categoryId : true,
    )
    .filter((listing) =>
      emirateFilter
        ? listing.emirate === emirateFilter || listing.city === emirateFilter
        : true,
    )
    .filter((listing) =>
      filters.area ? listing.area === filters.area : true,
    )
    .filter((listing) =>
      filters.condition ? listing.condition === filters.condition : true,
    )
    .filter((listing) =>
      filters.country ? listing.country === filters.country : true,
    )
    .filter((listing) =>
      typeof filters.minPrice === "number"
        ? listing.price >= filters.minPrice
        : true,
    )
    .filter((listing) =>
      typeof filters.maxPrice === "number"
        ? listing.price <= filters.maxPrice
        : true,
    )
    .filter((listing) =>
      filters.featured ? listing.isFeatured === true : true,
    )
    .filter((listing) =>
      filters.premium ? listing.isPremium === true : true,
    );

  return [...results].sort((first, second) => {
    if (filters.sort === "price_asc") {
      return first.price - second.price;
    }

    if (filters.sort === "price_desc") {
      return second.price - first.price;
    }

    const firstDate = first.postedAt ?? first.id;
    const secondDate = second.postedAt ?? second.id;
    return secondDate.localeCompare(firstDate);
  });
}
