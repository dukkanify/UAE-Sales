import { SearchResultsList } from "@/components/search/SearchResultsList";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
        <section className="app-container py-12">
          <SectionHeader
            eyebrow="الإعلانات المميزة"
            title="أفضل عروض UAE Sales"
            description="إعلانات مختارة بتجربة عرض احترافية وهوية إماراتية واضحة."
          />
          <SearchResultsList categories={categories} listings={listings} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
