import { BRAND } from "@/shared/constants/brand";
import { CategoryDirectory } from "@/features/categories/components/CategoryDirectory";
import { PageHero } from "@/shared/ui/PageHero";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { Icon } from "@/shared/ui/Icon";
import { getCategories } from "@/services/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const totalListings = categories.reduce((sum, category) => sum + category.listingCount, 0);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container px-3 pb-8 pt-4 md:page-padding">
          <PageHero
            compact
            description={`تصفح ${BRAND.nameAr} عبر أقسام واضحة تصلك مباشرة للإعلانات المناسبة.`}
            eyebrow="دليل السوق"
            title="الأقسام الرئيسية"
          >
            <div className="category-directory-stats">
              <span className="category-directory-stats__pill">
                <Icon aria-hidden name="grid" size={12} />
                {categories.length.toLocaleString("ar-AE")} قسم
              </span>
              <span className="category-directory-stats__pill">
                <Icon aria-hidden name="package" size={12} />
                {totalListings.toLocaleString("ar-AE")} إعلان نشط
              </span>
            </div>
          </PageHero>
          <CategoryDirectory categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
