import { mockListings, mockUserListings } from "./mockData";

type SearchListingsFilters = {
  categoryId?: string;
  city?: string;
  condition?: "new" | "used" | "excellent";
  country?: string;
  maxPrice?: number;
  minPrice?: number;
  query?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function getListings() {
  return mockListings;
}

export async function getMyListings() {
  return mockUserListings;
}

export async function getListingBySlug(slug: string) {
  return [...mockListings, ...mockUserListings].find(
    (listing) => listing.slug === slug,
  );
}

export async function getFeaturedListings() {
  return mockListings.filter((listing) => listing.isFeatured);
}

export async function getLatestListings() {
  return mockListings
    .filter((listing) => listing.status === "active")
    .slice(0, 12);
}

export async function getRelatedListings(categoryId: string, excludedId: string) {
  return mockListings
    .filter((listing) => listing.status === "active")
    .filter((listing) => listing.categoryId === categoryId)
    .filter((listing) => listing.id !== excludedId)
    .slice(0, 3);
}

export async function searchListings(filters: SearchListingsFilters = {}) {
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
