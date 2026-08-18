import { cities, countries } from "@/shared/constants/locations";
import { MobileBottomNav } from "@/features/home/components/mobile/MobileBottomNav";
import { CategoryFilterBar } from "@/features/search/components/CategoryFilterBar";
import { RecordRecentSearch } from "@/features/search/components/RecordRecentSearch";
import { SearchFilters } from "@/features/search/components/SearchFilters";
import { SearchResultsList } from "@/features/search/components/SearchResultsList";
import {
  parseSearchFilterState,
  toListingSearchFilters,
} from "@/features/search/components/parse-search-filters";
import { buildSearchSuggestions } from "@/features/search/components/search-suggestions";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";
import { getSearchSuggestionTitles } from "@/services/listings/home-feed";
import { searchListings } from "@/services/listings";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedFilters = parseSearchFilterState(params);

  const [categories, listings, suggestionTitles] = await Promise.all([
    getCategories(),
    searchListings(toListingSearchFilters(selectedFilters)),
    getSearchSuggestionTitles(),
  ]);

  const suggestions = buildSearchSuggestions({
    categories,
    cities,
    listings: suggestionTitles,
    selectedFilters,
  });

  return (
    <>
      <SiteHeader />
      <RecordRecentSearch query={selectedFilters.query} />
      <main className="bg-background">
        <section className="app-container page-padding pb-28 lg:pb-8">
          <div className="mb-6">
            <p className="text-xs font-bold text-[#B8955F]">بحث السوق</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">
              {selectedFilters.query
                ? `نتائج: ${selectedFilters.query}`
                : "اعثر على الإعلان المناسب"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              فلاتر ذكية تتغيّر حسب القسم: سيارات، عقارات، موبايلات، وباقي السوق.
            </p>
          </div>

          <CategoryFilterBar
            action="/search"
            categories={categories}
            selectedFilters={selectedFilters}
            showCategory
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <SearchFilters
                categories={categories}
                cities={cities}
                countries={countries}
                layout="sidebar"
                selectedFilters={selectedFilters}
                suggestions={suggestions}
              />
            </aside>

            <div>
              <SearchResultsList
                basePath="/search"
                categories={categories}
                listings={listings}
                selectedFilters={selectedFilters}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
