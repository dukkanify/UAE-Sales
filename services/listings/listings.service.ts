import type { Listing, ListingSearchFilters } from "@/types";
import { mockListings, mockUserListings } from "@/services/data";

export type { ListingSearchFilters };

export async function getListings(): Promise<Listing[]> {
  return mockListings;
}

export async function getMyListings(): Promise<Listing[]> {
  return mockUserListings;
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  return [...mockListings, ...mockUserListings].find(
    (listing) => listing.slug === slug,
  );
}

export async function getFeaturedListings(): Promise<Listing[]> {
  return mockListings.filter((listing) => listing.isFeatured);
}

export async function getLatestListings(): Promise<Listing[]> {
  return mockListings
    .filter((listing) => listing.status === "active")
    .slice(0, 12);
}

export async function getRelatedListings(
  categoryId: string,
  excludedId: string,
): Promise<Listing[]> {
  return mockListings
    .filter((listing) => listing.status === "active")
    .filter((listing) => listing.categoryId === categoryId)
    .filter((listing) => listing.id !== excludedId)
    .slice(0, 3);
}

export async function searchListings(
  filters: ListingSearchFilters = {},
): Promise<Listing[]> {
  const normalizedQuery = filters.query?.trim().toLowerCase();

  const results = mockListings
    .filter((listing) => listing.status === "active")
    .filter((listing) => {
      if (!normalizedQuery) {
        return true;
      }

      return [listing.title, listing.description, listing.city, listing.seller.name]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .filter((listing) =>
      filters.categoryId ? listing.categoryId === filters.categoryId : true,
    )
    .filter((listing) => (filters.city ? listing.city === filters.city : true))
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
    );

  return [...results].sort((first, second) => {
    if (filters.sort === "price_asc") {
      return first.price - second.price;
    }

    if (filters.sort === "price_desc") {
      return second.price - first.price;
    }

    return second.id.localeCompare(first.id);
  });
}
