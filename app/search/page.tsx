import { cities, countries } from "@/shared/constants/locations";
import { SearchFilters } from "@/features/search/components/SearchFilters";
import { SearchResultsList } from "@/features/search/components/SearchResultsList";
import { Badge } from "@/shared/ui/Badge";
import { PageHero } from "@/shared/ui/PageHero";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";
import { searchListings } from "@/services/listings";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getNumberParam(params: SearchParams, key: string) {
  const value = getParam(params, key);
  if (!value) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedFilters = {
    category: getParam(params, "category") ?? "",
    city: getParam(params, "city") ?? "",
    condition: getParam(params, "condition") ?? "",
    country: getParam(params, "country") ?? "",
    maxPrice: getParam(params, "maxPrice") ?? "",
    minPrice: getParam(params, "minPrice") ?? "",
    query: getParam(params, "q") ?? "",
    sort: getParam(params, "sort") ?? "newest",
  };

  const [categories, listings] = await Promise.all([
    getCategories(),
    searchListings({
      categoryId: selectedFilters.category || undefined,
      city: selectedFilters.city || undefined,
      condition:
        selectedFilters.condition === "new" ||
        selectedFilters.condition === "used" ||
        selectedFilters.condition === "excellent"
          ? selectedFilters.condition
          : undefined,
      country: selectedFilters.country || undefined,
      maxPrice: getNumberParam(params, "maxPrice"),
      minPrice: getNumberParam(params, "minPrice"),
      query: selectedFilters.query || undefined,
      sort:
        selectedFilters.sort === "price_asc" ||
        selectedFilters.sort === "price_desc"
          ? selectedFilters.sort
          : "newest",
    }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="فلترة دقيقة حسب المدينة والقسم والسعر وحالة المنتج."
            eyebrow="بحث متقدم"
            title="اعثر على الإعلان المناسب"
          />
          <SearchFilters
            categories={categories}
            cities={cities}
            countries={countries}
            selectedFilters={selectedFilters}
          />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              {listings.length.toLocaleString("ar-AE")} نتيجة
            </p>
            <Badge variant="escrow">ضمان مالي متاح</Badge>
          </div>
          <div className="mt-5">
            <SearchResultsList
              categories={categories}
              listings={listings}
              selectedFilters={selectedFilters}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
