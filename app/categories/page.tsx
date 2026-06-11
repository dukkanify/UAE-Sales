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
          <SectionHeader
            eyebrow="كل التصنيفات"
            title="الأقسام الرئيسية والفرعية"
            description="صفحة جاهزة للربط مع API التصنيفات، وتسمح للمستخدم بالانتقال مباشرة إلى نتائج البحث حسب القسم أو القسم الفرعي."
          />
          <CategoryDirectory categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
