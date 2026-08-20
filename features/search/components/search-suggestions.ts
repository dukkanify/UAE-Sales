import type { Category, City, Listing } from "@/types";
import type { SearchSuggestion } from "./SearchTypeahead";
import { buildSearchUrl, type SearchFilterState } from "./search-url";
import { listingTitle } from "@/shared/i18n/listing-copy";
import type { AppLocale } from "@/shared/i18n/locale";

/** Builds typeahead rows from categories, cities, and listing titles. */
export function buildSearchSuggestions({
  categories,
  cities,
  listings,
  locale = "ar",
  selectedFilters = {},
}: {
  categories: Category[];
  cities: City[];
  listings: Pick<Listing, "slug" | "title" | "titleEnglish">[];
  locale?: AppLocale;
  selectedFilters?: SearchFilterState;
}): SearchSuggestion[] {
  const categoryItems: SearchSuggestion[] = categories.map((category) => ({
    kind: "category",
    label: category.name,
    href: buildSearchUrl({ ...selectedFilters, category: category.id, query: "" }),
  }));

  const cityItems: SearchSuggestion[] = cities.map((city) => ({
    kind: "city",
    label: city.name,
    href: buildSearchUrl({ ...selectedFilters, city: city.name, query: "" }),
  }));

  const listingItems: SearchSuggestion[] = listings.slice(0, 40).map((listing) => ({
    kind: "listing",
    label: listingTitle(listing, locale),
    href: `/listings/${listing.slug}`,
  }));

  // Prefer categories/cities first, then listing titles for free-text matches.
  return [...categoryItems, ...cityItems, ...listingItems];
}
