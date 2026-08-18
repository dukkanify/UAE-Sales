"use client";

import type { Category } from "@/types";
import { SavedSearches } from "./SavedSearches";
import { SearchFilterChips } from "./SearchFilterChips";
import { SearchQuickFilters } from "./SearchQuickFilters";
import { buildSearchUrl, type SearchFilterState } from "./search-url";

type SearchResultsToolbarProps = {
  basePath?: string;
  categories: Category[];
  resultCount: number;
  selectedFilters: SearchFilterState;
};

function buildLabel(filters: SearchFilterState) {
  if (filters.query) return filters.query;
  const spec = Object.values(filters.specs ?? {}).find(Boolean);
  const parts = [filters.city, spec].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "بحث مخصص";
}

export function SearchResultsToolbar({
  basePath = "/search",
  categories,
  resultCount,
  selectedFilters,
}: SearchResultsToolbarProps) {
  const currentUrl = buildSearchUrl(selectedFilters, undefined, basePath);

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
      <SearchQuickFilters
        basePath={basePath}
        categories={categories}
        selectedFilters={selectedFilters}
      />
      <SearchFilterChips
        basePath={basePath}
        categories={categories}
        selectedFilters={selectedFilters}
      />
      <SavedSearches currentLabel={buildLabel(selectedFilters)} currentUrl={currentUrl} />
    </div>
  );
}
