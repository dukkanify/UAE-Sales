import { CategoryDirectory } from "@/components/categories/CategoryDirectory";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container py-12 lg:py-16">
          <div className="mb-10 overflow-hidden rounded-[var(--radius-xl)] border border-white bg-[linear-gradient(135deg,#fff7ec,#f8f0e5_55%,#fffdf8)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="uae-flag-strip mb-6 h-2 w-36 rounded-full" />
            <SectionHeader
              eyebrow="دليل السوق"
              title="الأقسام الرئيسية والفرعية"
              description="تصفح سوق الإمارات عبر أقسام واضحة ومصممة لتوصلك مباشرة للإعلانات المناسبة داخل كل مدينة وإمارة."
            />
          </div>
          <CategoryDirectory categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
