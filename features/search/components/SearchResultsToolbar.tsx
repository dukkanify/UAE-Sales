"use client";

import type { Category } from "@/types";
import { SavedSearches } from "./SavedSearches";
import { SearchFilterChips } from "./SearchFilterChips";

type SearchResultsToolbarProps = {
  categories: Category[];
  resultCount: number;
  selectedFilters: {
    category?: string;
    city?: string;
    condition?: string;
    country?: string;
    maxPrice?: string;
    minPrice?: string;
    query?: string;
    sort?: string;
  };
};

function buildCurrentUrl(filters: SearchResultsToolbarProps["selectedFilters"]) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.country) params.set("country", filters.country);
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

function buildLabel(filters: SearchResultsToolbarProps["selectedFilters"]) {
  if (filters.query) return filters.query;
  const parts = [filters.city, filters.country].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "بحث مخصص";
}

export function SearchResultsToolbar({
  categories,
  resultCount,
  selectedFilters,
}: SearchResultsToolbarProps) {
  const currentUrl = buildCurrentUrl(selectedFilters);

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">
          <span className="text-lg font-bold text-primary">
            {resultCount.toLocaleString("ar-AE")}
          </span>{" "}
          إعلان
        </p>
      </div>
      <SearchFilterChips categories={categories} selectedFilters={selectedFilters} />
      <SavedSearches currentLabel={buildLabel(selectedFilters)} currentUrl={currentUrl} />
    </div>
  );
}
