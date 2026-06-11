import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cities, countries } from "@/constants/locations";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import {
  getCategories,
  getCategoryBySlug,
} from "@/services/categoriesService";
import { searchListings } from "@/services/listingsService";

type SearchParams = Record<string, string | string[] | undefined>;

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<SearchParams>;
};

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

export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "القسم غير موجود | UAE Sales",
    };
  }

  return {
    title: `${category.name} | UAE Sales`,
    description: `تصفح إعلانات ${category.name} في سوق الإمارات.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

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
        <section className="app-container py-10 lg:py-14">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-muted">
            <Link href="/" className="transition hover:text-primary">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/categories" className="transition hover:text-primary">
              التصنيفات
            </Link>
            <span>/</span>
            <span className="text-ink">{category.name}</span>
          </nav>

          <SectionHeader
            eyebrow="صفحة القسم"
            title={category.name}
            description={`تصفح ${category.listingCount.toLocaleString(
              "ar-AE",
            )} إعلان في قسم ${category.name} مع فلاتر جاهزة للربط بالـ API.`}
          />

          <div className="mb-6 flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory}
                href={`/categories/${category.slug}?q=${encodeURIComponent(
                  subcategory,
                )}`}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-primary hover:bg-primary-soft hover:text-primary"
              >
                {subcategory}
              </Link>
            ))}
          </div>

          <SearchFilters
            action={`/categories/${category.slug}`}
            categories={categories}
            cities={cities}
            countries={countries}
            selectedFilters={selectedFilters}
            showCategory={false}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-bold text-muted">
              {listings.length.toLocaleString("ar-AE")} إعلان مطابق داخل القسم
            </p>
            <Link
              href={`/search?category=${category.id}`}
              className="rounded-full bg-primary-soft px-4 py-2 text-xs font-black text-primary transition hover:bg-primary hover:text-white"
            >
              عرض في نتائج البحث العامة
            </Link>
          </div>

          <div className="mt-6">
            <SearchResultsList
              categoryId={category.id}
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
