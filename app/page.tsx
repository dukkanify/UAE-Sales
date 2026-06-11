import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { SearchHero } from "@/components/home/SearchHero";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";
import { getFeaturedListings } from "@/services/listingsService";

export default async function Home() {
  const [categories, featuredListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <SearchHero categories={categories} />
        <CategoriesGrid categories={categories} />
        <FeaturedListings listings={featuredListings} />
        <section className="app-container py-12">
          <div className="grid gap-5 rounded-[var(--radius-xl)] bg-ink p-6 text-white md:grid-cols-3 md:p-8">
            <div>
              <p className="text-sm font-bold text-emerald-100">جاهز للربط</p>
              <h2 className="mt-2 text-2xl font-black">طبقة API منظمة</h2>
            </div>
            <p className="leading-8 text-white/75 md:col-span-2">
              تم فصل واجهات العرض عن مصادر البيانات عبر services قابلة للتبديل
              بين mock data وواجهات backend للإعلانات، التصنيفات، الطلبات،
              المحفظة، والدردشة.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
