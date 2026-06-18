import Link from "next/link";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="app-container py-8">
      <SectionHeader
        eyebrow="التصنيفات الرئيسية"
        title="تصفح حسب القسم"
        description="اختصر الطريق وابدأ من القسم المناسب."
        action={
          <Link
            href="/categories"
            className="text-sm font-black text-primary transition hover:text-primary-dark"
          >
            عرض كل التصنيفات
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group relative h-full overflow-hidden p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl">
              <div className="uae-flag-strip absolute inset-x-0 top-0 h-1" />
              <div className="relative mx-auto mb-3 grid size-14 place-items-center rounded-2xl border border-secondary/25 bg-white text-3xl text-secondary shadow-sm transition group-hover:bg-secondary-soft">
                {category.icon}
              </div>
              <h3 className="relative text-sm font-black text-ink transition group-hover:text-primary">
                {category.name}
              </h3>
              <p className="relative mt-1 text-xs font-bold text-muted">
                {category.listingCount.toLocaleString("ar-AE")} إعلان
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
