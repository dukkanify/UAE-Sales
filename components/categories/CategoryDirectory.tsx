import Link from "next/link";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";

type CategoryDirectoryProps = {
  categories: Category[];
};

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5 hover:border-secondary hover:shadow-2xl"
        >
          <div className="uae-flag-strip absolute inset-x-0 top-0 h-1.5" />
          <div className="absolute -left-10 -top-10 size-28 rounded-full bg-secondary/15 blur-2xl transition group-hover:bg-secondary/25" />
          <div className="grid gap-4 sm:flex sm:items-start">
            <span className="relative grid size-16 shrink-0 place-items-center rounded-3xl bg-secondary-soft text-3xl shadow-sm">
              {category.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-xl font-black text-ink transition group-hover:text-secondary"
                >
                  {category.name}
                </Link>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-muted">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </span>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory}
                    href={`/categories/${category.slug}?q=${encodeURIComponent(
                      subcategory,
                    )}`}
                    className="rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm font-bold text-muted transition hover:border-secondary hover:bg-secondary-soft hover:text-primary"
                  >
                    {subcategory}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
