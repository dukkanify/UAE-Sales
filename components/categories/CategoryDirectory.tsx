import Link from "next/link";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Icon } from "@/components/ui/Icon";

type CategoryDirectoryProps = {
  categories: Category[];
};

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {categories.map((category) => (
        <Card key={category.id} className="p-5" interactive>
          <div className="flex gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
              <CategoryIcon category={category} size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  className="text-lg font-semibold text-ink transition hover:text-primary"
                  href={`/categories/${category.slug}`}
                >
                  {category.name}
                </Link>
                <span className="text-xs font-medium text-muted">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.subcategories.slice(0, 4).map((subcategory) => (
                  <Link
                    key={subcategory}
                    className="rounded-[var(--radius-xl)] border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted transition hover:border-secondary/40 hover:text-ink"
                    href={`/categories/${category.slug}?q=${encodeURIComponent(subcategory)}`}
                  >
                    {subcategory}
                  </Link>
                ))}
              </div>
              <Link
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                href={`/categories/${category.slug}`}
              >
                عرض الكل
                <Icon name="arrow-left" size={12} />
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
