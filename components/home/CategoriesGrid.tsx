import Link from "next/link";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="app-container py-12">
      <SectionHeader
        eyebrow="التصنيفات"
        title="استكشف الأقسام الرئيسية"
        description="هيكل تصنيفات قابل للتوسع والربط مع API التصنيفات لاحقاً."
        action={
          <Link
            href="/categories"
            className="text-sm font-black text-primary transition hover:text-primary-dark"
          >
            عرض كل التصنيفات
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <span className="grid size-14 place-items-center rounded-3xl bg-primary-soft text-2xl">
                  {category.icon}
                </span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-muted">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </span>
              </div>
              <h3 className="text-xl font-black text-ink">{category.name}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.subcategories.slice(0, 3).map((subcategory) => (
                  <span
                    key={subcategory}
                    className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted"
                  >
                    {subcategory}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
