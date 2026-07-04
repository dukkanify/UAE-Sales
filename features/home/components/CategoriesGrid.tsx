import Link from "next/link";
import type { Category } from "@/types";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
import { Button } from "@/shared/ui/Button";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { SectionHeader } from "@/shared/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const popular = categories.slice(0, 8);

  return (
    <section className="relative overflow-hidden">
      <SectionBackdrop variant="mesh" />

      <div className="app-container relative section-padding">
        <SectionHeader
          action={
            <Button href="/categories" size="sm" variant="primary">
              عرض الكل
            </Button>
          }
          description="اكتشف آلاف الإعلانات في أهم التصنيفات — تصفح بسهولة وابحث بذكاء."
          eyebrow="التصنيفات"
          title="ماذا تبحث عنه؟"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {popular.map((category) => (
            <Link
              key={category.id}
              className="category-tile group flex flex-col items-center rounded-[var(--radius-2xl)] border border-border bg-surface p-5 text-center"
              href={`/categories/${category.slug}`}
            >
              <span className="grid size-14 place-items-center rounded-[var(--radius-2xl)] bg-gradient-to-br from-secondary-soft to-surface text-secondary transition group-hover:scale-105">
                <CategoryIcon category={category} size={26} />
              </span>
              <h3 className="mt-4 line-clamp-2 text-sm font-bold text-ink">
                {category.name}
              </h3>
              <p className="mt-1.5 text-xs font-semibold text-muted">
                {category.listingCount.toLocaleString("ar-AE")} إعلان
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
