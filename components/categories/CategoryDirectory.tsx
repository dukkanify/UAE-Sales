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
        <Card key={category.id} className="p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-primary-soft text-3xl">
              {category.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/search?category=${category.id}`}
                  className="text-xl font-black text-ink transition hover:text-primary"
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
                    href={`/search?category=${category.id}&q=${encodeURIComponent(
                      subcategory,
                    )}`}
                    className="rounded-2xl border border-border px-4 py-3 text-sm font-bold text-muted transition hover:border-primary hover:bg-primary-soft hover:text-primary"
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
