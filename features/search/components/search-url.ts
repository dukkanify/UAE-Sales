/** Shared helpers for building search / category URLs from filter state. */

import { GENERIC_FILTER_KEYS } from "@/shared/constants/category-filters";

export type SearchFilterState = {
  category?: string;
  city?: string;
  condition?: string;
  country?: string;
  maxPrice?: string;
  minPrice?: string;
  price?: string;
  query?: string;
  sort?: string;
  specs?: Record<string, string>;
};

export function parsePriceBand(band?: string): {
  maxPrice?: number;
  minPrice?: number;
} {
  if (!band) return {};
  if (band.endsWith("+")) {
    const minPrice = Number(band.slice(0, -1));
    return Number.isFinite(minPrice) ? { minPrice } : {};
  }
  const [rawMin, rawMax] = band.split("-");
  const minPrice = Number(rawMin);
  const maxPrice = Number(rawMax);
  return {
    ...(Number.isFinite(minPrice) ? { minPrice } : {}),
    ...(Number.isFinite(maxPrice) ? { maxPrice } : {}),
  };
}

export function priceBandFromRange(minPrice?: string, maxPrice?: string): string {
  if (!minPrice && !maxPrice) return "";
  if (minPrice && !maxPrice) return `${minPrice}+`;
  if (!minPrice && maxPrice) return `0-${maxPrice}`;
  return `${minPrice}-${maxPrice}`;
}

function appendFilters(params: URLSearchParams, filters: SearchFilterState, omitKey?: string) {
  if (filters.query && omitKey !== "query" && omitKey !== "q") {
    params.set("q", filters.query);
  }
  if (filters.country && omitKey !== "country") params.set("country", filters.country);
  if (filters.city && omitKey !== "city") params.set("city", filters.city);
  if (filters.category && omitKey !== "category") params.set("category", filters.category);
  if (filters.condition && omitKey !== "condition") {
    params.set("condition", filters.condition);
  }
  if (filters.minPrice && omitKey !== "minPrice" && omitKey !== "price") {
    params.set("minPrice", filters.minPrice);
  }
  if (filters.maxPrice && omitKey !== "maxPrice" && omitKey !== "price") {
    params.set("maxPrice", filters.maxPrice);
  }
  if (filters.price && omitKey !== "price") params.set("price", filters.price);
  if (filters.sort && filters.sort !== "newest" && omitKey !== "sort") {
    params.set("sort", filters.sort);
  }
  for (const [key, value] of Object.entries(filters.specs ?? {})) {
    if (!value || GENERIC_FILTER_KEYS.has(key)) continue;
    if (omitKey === key || omitKey === `specs.${key}`) continue;
    params.set(key, value);
  }
}

export function buildSearchUrl(
  filters: SearchFilterState,
  omitKey?: string,
  pathname = "/search",
): string {
  const params = new URLSearchParams();
  appendFilters(params, filters, omitKey);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function mergeSearchFilters(
  base: SearchFilterState,
  patch: Partial<SearchFilterState>,
): SearchFilterState {
  return {
    ...base,
    ...patch,
    specs: { ...base.specs, ...patch.specs },
  };
}
