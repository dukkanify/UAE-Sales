import Link from "next/link";
import type { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
            <Link href="/categories">
              <Button size="sm" variant="secondary">
                عرض الكل
              </Button>
            </Link>
          }
          description="اكتشف آلاف الإعلانات في أهم التصنيفات."
          eyebrow="التصنيفات"
          title="ماذا تبحث عنه؟"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((category) => (
            <Link
              key={category.id}
              className="interactive-lift flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
              href={`/categories/${category.slug}`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-secondary-soft text-xl">
                {category.icon}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-ink">
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
