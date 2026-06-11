import { cities, countries } from "@/constants/locations";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";
import { searchListings } from "@/services/listingsService";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getNumberParam(params: SearchParams, key: string) {
  const value = getParam(params, key);

  if (!value) {
    return undefined;
  }

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
        <section className="app-container py-12 lg:py-16">
          <div className="mb-8 overflow-hidden rounded-[var(--radius-xl)] border border-white bg-[linear-gradient(135deg,#fff7ec,#f8f0e5_55%,#fffdf8)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="uae-flag-strip mb-6 h-2 w-36 rounded-full" />
            <SectionHeader
              eyebrow="بحث متقدم"
              title="اعثر على الإعلان المناسب بسرعة"
              description="فلترة احترافية حسب المدينة، القسم، السعر، وحالة المنتج مع دعم الإعلانات المنشورة محلياً في التجربة."
            />
          </div>
          <SearchFilters
            categories={categories}
            cities={cities}
            countries={countries}
            selectedFilters={selectedFilters}
          />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-bold text-muted">
              {listings.length.toLocaleString("ar-AE")} نتيجة من البيانات الأساسية
            </p>
            <p className="rounded-full bg-secondary-soft px-4 py-2 text-xs font-black text-primary">
              الضمان المالي متاح عند الشراء
            </p>
          </div>
          <div className="mt-6">
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
