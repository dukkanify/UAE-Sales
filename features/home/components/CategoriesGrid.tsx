import Link from "next/link";
import type { Category } from "@/types";
import { Button } from "@/shared/ui/Button";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { SectionHeader } from "@/shared/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const popular = categories.slice(0, 8);

  return (
    <section className="relative overflow-hidden section-padding bg-[linear-gradient(180deg,#fff,var(--color-background))]">
      <div className="pointer-events-none absolute inset-x-8 top-10 h-px bg-gradient-to-l from-transparent via-secondary/25 to-transparent" />
      <div className="app-container">
        <SectionHeader
          action={
            <Button href="/categories" size="sm" variant="secondary">
              عرض الكل
            </Button>
          }
          description="تصفح آلاف الإعلانات حسب القسم، من السيارات والعقارات إلى الأجهزة والخدمات."
          eyebrow="التصنيفات"
          title="ماذا تبحث عنه؟"
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {popular.map((category) => (
            <Link
              key={category.id}
              className="group rounded-[var(--radius-2xl)] border border-border bg-surface p-5 text-center shadow-[var(--shadow-xs)] transition duration-300 hover:-translate-y-1 hover:border-secondary/35 hover:bg-secondary-soft/35 hover:shadow-[var(--shadow-md)]"
              href={`/categories/${category.slug}`}
            >
              <span className="mx-auto grid size-14 place-items-center rounded-[var(--radius-2xl)] bg-surface-muted text-secondary transition group-hover:bg-surface group-hover:shadow-[var(--shadow-xs)]">
                <CategoryIcon category={category} size={24} />
              </span>
              <h3 className="mt-4 line-clamp-1 text-sm font-bold text-ink">
                {category.name}
              </h3>
              <p className="mt-1 text-xs font-semibold text-muted">
                {category.listingCount.toLocaleString("ar-AE")} إعلان
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
