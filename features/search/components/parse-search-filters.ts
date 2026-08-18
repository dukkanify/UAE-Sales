import {
  GENERIC_FILTER_KEYS,
  getAllKnownSpecKeys,
} from "@/shared/constants/category-filters";
import {
  parsePriceBand,
  type SearchFilterState,
} from "@/features/search/components/search-url";
import type { ListingSearchFilters } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

export function getSearchParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function getSearchNumberParam(params: SearchParams, key: string) {
  const value = getSearchParam(params, key);
  if (!value) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export function parseSearchFilterState(
  params: SearchParams,
  lockedCategory?: string,
): SearchFilterState {
  const priceBand = parsePriceBand(getSearchParam(params, "price"));
  const specs: Record<string, string> = {};
  for (const key of getAllKnownSpecKeys()) {
    const value = getSearchParam(params, key)?.trim();
    if (value) specs[key] = value;
  }
  for (const [key, raw] of Object.entries(params)) {
    if (GENERIC_FILTER_KEYS.has(key) || specs[key]) continue;
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (value) specs[key] = value;
  }

  return {
    category: lockedCategory ?? getSearchParam(params, "category") ?? "",
    city: getSearchParam(params, "city") ?? "",
    condition: getSearchParam(params, "condition") ?? specs.condition ?? "",
    country: getSearchParam(params, "country") ?? "",
    maxPrice:
      getSearchParam(params, "maxPrice") ??
      (priceBand.maxPrice != null ? String(priceBand.maxPrice) : ""),
    minPrice:
      getSearchParam(params, "minPrice") ??
      (priceBand.minPrice != null ? String(priceBand.minPrice) : ""),
    price: getSearchParam(params, "price") ?? "",
    query: getSearchParam(params, "q") ?? "",
    sort: getSearchParam(params, "sort") ?? "newest",
    specs,
  };
}

export function toListingSearchFilters(
  filters: SearchFilterState,
): ListingSearchFilters {
  const price = parsePriceBand(filters.price);
  const minPrice = filters.minPrice ? Number(filters.minPrice) : price.minPrice;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : price.maxPrice;

  return {
    categoryId: filters.category || undefined,
    city: filters.city || undefined,
    condition:
      filters.condition === "new" ||
      filters.condition === "used" ||
      filters.condition === "excellent"
        ? filters.condition
        : undefined,
    country: filters.country || undefined,
    maxPrice:
      typeof maxPrice === "number" && Number.isFinite(maxPrice)
        ? maxPrice
        : undefined,
    minPrice:
      typeof minPrice === "number" && Number.isFinite(minPrice)
        ? minPrice
        : undefined,
    query: filters.query || undefined,
    sort:
      filters.sort === "price_asc" || filters.sort === "price_desc"
        ? filters.sort
        : "newest",
    specs: filters.specs,
  };
}
