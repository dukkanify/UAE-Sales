import { BRAND } from "@/shared/constants/brand";
import { CategoryDirectory } from "@/features/categories/components/CategoryDirectory";
import { MobileBottomNav } from "@/features/home/components/mobile/MobileBottomNav";
import { PageHero } from "@/shared/ui/PageHero";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding pb-28 lg:pb-8">
          <PageHero
            description={`تصفح ${BRAND.nameAr} عبر أقسام واضحة تصلك مباشرة للإعلانات المناسبة.`}
            eyebrow="دليل السوق"
            title="الأقسام الرئيسية"
          />
          <CategoryDirectory categories={categories} />
        </section>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}
