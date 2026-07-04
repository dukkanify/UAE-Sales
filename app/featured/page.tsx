import { SearchResultsList } from "@/components/search/SearchResultsList";
import { PageHero } from "@/components/ui/PageHero";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";
import { getFeaturedListings } from "@/services/listingsService";

export default async function FeaturedPage() {
  const [categories, listings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="إعلانات مختارة بعناية من بائعين موثوقين مع ضمان مالي كامل."
            eyebrow="إعلانات مميزة"
            title="أفضل العروض"
          />
          <SearchResultsList categories={categories} listings={listings} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
