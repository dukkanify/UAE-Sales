import Link from "next/link";
import type { Category } from "@/types";
import { SectionHeader } from "@/components/ui/SectionHeader";

type CategoriesGridProps = {
  categories: Category[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const popular = categories.slice(0, 8);

  return (
    <section className="section-padding bg-surface-muted/40">
      <div className="app-container">
        <SectionHeader
          action={
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-5 text-sm font-bold text-ink transition hover:bg-surface"
              href="/categories"
            >
              عرض الكل
            </Link>
          }
          description="اكتشف آلاف الإعلانات في أهم التصنيفات داخل الإمارات."
          eyebrow="التصنيفات الشائعة"
          title="ماذا تبحث عنه؟"
        />

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {popular.map((category) => (
            <Link
              key={category.id}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition duration-300 hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-[var(--shadow-md)]"
              href={`/categories/${category.slug}`}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary-soft text-2xl transition group-hover:scale-105">
                {category.icon}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-ink transition group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-muted">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
