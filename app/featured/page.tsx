import { SearchResultsList } from "@/features/search/components/SearchResultsList";
import { PageHero } from "@/shared/ui/PageHero";
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
