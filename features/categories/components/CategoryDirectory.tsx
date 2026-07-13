import Link from "next/link";
import type { Category } from "@/types";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type CategoryDirectoryProps = {
  categories: Category[];
};

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden p-0" interactive>
          <div className="flex gap-0">
            <div className="flex shrink-0 items-start p-4 sm:p-5">
              <CategoryThumbnail category={category} size="lg" />
            </div>
            <div className="min-w-0 flex-1 py-5 pe-5 ps-0">
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
              {category.featuredListingSlug ? (
                <Link
                  className="mt-2 inline-block text-xs font-semibold text-primary"
                  href={`/listings/${category.featuredListingSlug}`}
                >
                  إعلان مميز في هذا القسم ←
                </Link>
              ) : null}
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
