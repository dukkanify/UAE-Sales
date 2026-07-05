import { cities, countries } from "@/shared/constants/locations";
import { SearchFilters } from "@/features/search/components/SearchFilters";
import { SearchResultsList } from "@/features/search/components/SearchResultsList";
import { Badge } from "@/shared/ui/Badge";
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
      <main className="bg-[#fdfbf7]">
        <section className="app-container page-padding">
          <div className="mb-8">
            <p className="text-xs font-bold text-[#B8955F]">بحث السوق</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">
              {selectedFilters.query
                ? `نتائج: ${selectedFilters.query}`
                : "اعثر على الإعلان المناسب"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              فلترة دقيقة حسب الإمارة والتصنيف والسعر — نفس جودة عرض الإعلانات في
              الصفحة الرئيسية.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <SearchFilters
                categories={categories}
                cities={cities}
                countries={countries}
                layout="sidebar"
                selectedFilters={selectedFilters}
              />
            </aside>

            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  {listings.length.toLocaleString("ar-AE")} إعلان
                </p>
                <Badge variant="escrow">ضمان مالي متاح</Badge>
              </div>
              <SearchResultsList
                categories={categories}
                listings={listings}
                selectedFilters={selectedFilters}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
