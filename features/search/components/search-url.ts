/** Shared helpers for building /search URLs from filter state. */

export type SearchFilterState = {
  category?: string;
  city?: string;
  condition?: string;
  country?: string;
  maxPrice?: string;
  minPrice?: string;
  query?: string;
  sort?: string;
};

export function buildSearchUrl(
  filters: SearchFilterState,
  omitKey?: keyof SearchFilterState,
): string {
  const params = new URLSearchParams();

  if (filters.query && omitKey !== "query") params.set("q", filters.query);
  if (filters.country && omitKey !== "country") params.set("country", filters.country);
  if (filters.city && omitKey !== "city") params.set("city", filters.city);
  if (filters.category && omitKey !== "category") {
    params.set("category", filters.category);
  }
  if (filters.condition && omitKey !== "condition") {
    params.set("condition", filters.condition);
  }
  if (filters.minPrice && omitKey !== "minPrice") {
    params.set("minPrice", filters.minPrice);
  }
  if (filters.maxPrice && omitKey !== "maxPrice") {
    params.set("maxPrice", filters.maxPrice);
  }
  if (filters.sort && filters.sort !== "newest" && omitKey !== "sort") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export function mergeSearchFilters(
  base: SearchFilterState,
  patch: Partial<SearchFilterState>,
): SearchFilterState {
  return { ...base, ...patch };
}
