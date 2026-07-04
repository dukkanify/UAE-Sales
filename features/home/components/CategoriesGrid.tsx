import Link from "next/link";
import type { Category } from "@/types";
import { Button } from "@/shared/ui/Button";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Icon } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const popular = categories.slice(0, 8);

  return (
    <section className="section-padding bg-surface-muted/50">
      <div className="app-container">
        <SectionHeader
          action={
            <Button href="/categories" size="sm" variant="secondary">
              عرض الكل
            </Button>
          }
          description="اكتشف آلاف الإعلانات في أهم التصنيفات."
          eyebrow="التصنيفات"
          title="ماذا تبحث عنه؟"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((category) => (
            <Link
              key={category.id}
              className="interactive-lift flex items-center gap-3 rounded-[var(--radius-2xl)] border border-border bg-surface p-4"
              href={`/categories/${category.slug}`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                <CategoryIcon category={category} size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-muted">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </p>
              </div>
              <Icon className="mr-auto shrink-0 text-muted" name="arrow-left" size={14} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
