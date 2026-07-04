import { CategoryDirectory } from "@/components/categories/CategoryDirectory";
import { PageHero } from "@/components/ui/PageHero";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="تصفح سوق الإمارات عبر أقسام واضحة تصلك مباشرة للإعلانات المناسبة."
            eyebrow="دليل السوق"
            title="الأقسام الرئيسية"
          />
          <CategoryDirectory categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
