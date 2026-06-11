import Link from "next/link";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="app-container py-14">
      <SectionHeader
        eyebrow="الأقسام الذكية"
        title="كل ما تحتاجه في سوق واحد"
        description="تصنيفات منظمة بتجربة سريعة وواضحة، من السيارات والعقارات إلى الخدمات والحيوانات."
        action={
          <Link
            href="/categories"
            className="text-sm font-black text-primary transition hover:text-primary-dark"
          >
            عرض كل التصنيفات
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-2xl">
              <div className="absolute -left-12 -top-12 size-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
              <div className="relative mb-6 flex items-start justify-between gap-4">
                <span className="grid size-16 place-items-center rounded-[1.35rem] bg-gradient-to-br from-primary-soft to-white text-3xl shadow-sm transition group-hover:scale-105">
                  {category.icon}
                </span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-muted">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </span>
              </div>
              <h3 className="relative text-xl font-black text-ink transition group-hover:text-primary">
                {category.name}
              </h3>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {category.subcategories.slice(0, 3).map((subcategory) => (
                  <span
                    key={subcategory}
                    className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-bold text-muted"
                  >
                    {subcategory}
                  </span>
                ))}
              </div>
              <p className="relative mt-5 text-sm font-black text-primary">
                تصفح القسم ←
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
