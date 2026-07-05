import { SearchResultsList } from "@/features/search/components/SearchResultsList";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";
import { getFeaturedListings } from "@/services/listings";

export default async function FeaturedPage() {
  const [categories, listings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="bg-[#fdfbf7]">
        <section className="app-container page-padding">
          <div className="mb-8">
            <p className="text-xs font-bold text-[#B8955F]">إعلانات مميزة</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">
              أفضل العروض في الإمارات
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              إعلانات مختارة بعناية من بائعين موثوقين مع ضمان مالي كامل.
            </p>
          </div>
          <SearchResultsList categories={categories} listings={listings} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
