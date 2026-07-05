import type { Listing, ListingSearchFilters } from "@/types";
import { mockListings, mockUserListings } from "@/mock";

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

function matchesQuery(listing: Listing, query: string): boolean {
  const haystack = [
    listing.title,
    listing.titleEnglish,
    listing.description,
    listing.descriptionEnglish,
    listing.city,
    listing.emirate,
    listing.area,
    listing.subcategory,
    listing.seller.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export async function searchListings(
  filters: ListingSearchFilters = {},
): Promise<Listing[]> {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const emirateFilter = filters.emirate ?? filters.city;

  const results = mockListings
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
