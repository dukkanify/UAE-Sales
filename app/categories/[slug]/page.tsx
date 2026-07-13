import type { Metadata } from "next";
import { BRAND } from "@/shared/constants/brand";
import { notFound } from "next/navigation";
import { cities, countries } from "@/shared/constants/locations";
import { CategoryHero } from "@/features/categories/components/CategoryHero";
import { SearchFilters } from "@/features/search/components/SearchFilters";
import { SearchResultsList } from "@/features/search/components/SearchResultsList";
import { Badge } from "@/shared/ui/Badge";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { ChipLink } from "@/shared/ui/ChipLink";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import {
  getCategories,
  getCategoryBySlug,
} from "@/services/categories";
import { searchListings } from "@/services/listings";

const ESCROW_CHECKOUT_CATEGORIES = new Set([
  "mobiles",
  "electronics",
  "furniture",
  "fashion",
  "kids",
  "sports",
  "books",
  "food",
  "cars",
]);

type SearchParams = Record<string, string | string[] | undefined>;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

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

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: `القسم غير موجود | Sooqna` };
  return {
    title: `${category.name} | Sooqna`,
    description: `تصفح إعلانات ${category.name} في ${BRAND.nameAr}.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const selectedFilters = {
    city: getParam(queryParams, "city") ?? "",
    condition: getParam(queryParams, "condition") ?? "",
    country: getParam(queryParams, "country") ?? "",
    maxPrice: getParam(queryParams, "maxPrice") ?? "",
    minPrice: getParam(queryParams, "minPrice") ?? "",
    query: getParam(queryParams, "q") ?? "",
    sort: getParam(queryParams, "sort") ?? "newest",
  };

  const [categories, listings] = await Promise.all([
    getCategories(),
    searchListings({
      categoryId: category.id,
      city: selectedFilters.city || undefined,
      condition:
        selectedFilters.condition === "new" ||
        selectedFilters.condition === "used" ||
        selectedFilters.condition === "excellent"
          ? selectedFilters.condition
          : undefined,
      country: selectedFilters.country || undefined,
      maxPrice: getNumberParam(queryParams, "maxPrice"),
      minPrice: getNumberParam(queryParams, "minPrice"),
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
          <Breadcrumbs
            items={[
              { href: "/", label: "الرئيسية" },
              { href: "/categories", label: "التصنيفات" },
              { label: category.name },
            ]}
          />

          <CategoryHero category={category} />

          <div className="mb-6 flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <ChipLink
                key={subcategory}
                href={`/categories/${category.slug}?q=${encodeURIComponent(subcategory)}`}
                label={subcategory}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <SearchFilters
                action={`/categories/${category.slug}`}
                categories={categories}
                cities={cities}
                countries={countries}
                layout="sidebar"
                selectedFilters={selectedFilters}
                showCategory={false}
              />
            </aside>

            <div>
              <div className="mt-0 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  {listings.length.toLocaleString("ar-AE")} نتيجة
                </p>
                {ESCROW_CHECKOUT_CATEGORIES.has(category.id) ? (
                  <Badge variant="escrow">ضمان مالي على الإعلانات المؤهلة</Badge>
                ) : null}
              </div>

              <div className="mt-5">
                <SearchResultsList
                  categoryId={category.id}
                  categories={categories}
                  listings={listings}
                  selectedFilters={selectedFilters}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
