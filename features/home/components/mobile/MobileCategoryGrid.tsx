import Link from "next/link";
import type { Category } from "@/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import {
  getMobileMainCategories,
  MOBILE_MAIN_CATEGORY_LABELS,
} from "./mobile-home.config";

type MobileCategoryGridProps = {
  categories: Category[];
};

export function MobileCategoryGrid({ categories }: MobileCategoryGridProps) {
  const items = getMobileMainCategories(categories);

  return (
    <section aria-label="التصنيفات الرئيسية" className="px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-black text-ink">التصنيفات الرئيسية</h2>
        <Link className="text-xs font-bold text-secondary" href="/categories">
          عرض الكل
        </Link>
      </div>

      <div className="mobile-home-scroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {items.map((category) => (
          <Link
            key={category.id}
            className="mobile-home-category-card group flex w-[5.5rem] shrink-0 flex-col items-center gap-2.5 text-center"
            href={`/categories/${category.slug}`}
          >
            <span className="grid size-[4.5rem] place-items-center rounded-2xl border border-border/80 bg-surface shadow-[var(--shadow-sm)] transition duration-200 group-active:scale-95">
              <CategoryIcon category={category} className="text-secondary" size={26} />
            </span>
            <span className="text-xs font-bold text-ink">
              {MOBILE_MAIN_CATEGORY_LABELS[category.id] ?? category.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-4 rounded-full bg-secondary" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
      </div>
    </section>
  );
}
