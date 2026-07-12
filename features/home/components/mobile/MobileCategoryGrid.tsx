import Link from "next/link";
import type { Category } from "@/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import {
  getMobileHomeCategories,
  MOBILE_CATEGORY_SHORT_LABELS,
} from "./mobile-home.config";

type MobileCategoryGridProps = {
  categories: Category[];
};

export function MobileCategoryGrid({ categories }: MobileCategoryGridProps) {
  const items = getMobileHomeCategories(categories);

  return (
    <section aria-label="التصنيفات" className="px-4 pt-4">
      <div className="mobile-home-surface rounded-[1.25rem] p-4 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {items.map((category) => (
            <Link
              key={category.id}
              className="group flex flex-col items-center gap-2 text-center"
              href={`/categories/${category.slug}`}
            >
              <span className="mobile-home-category-icon grid size-[3.25rem] place-items-center rounded-2xl transition duration-200 group-active:scale-95">
                <CategoryIcon category={category} className="text-secondary" size={22} />
              </span>
              <span className="line-clamp-2 text-[0.7rem] font-bold leading-tight text-ink">
                {MOBILE_CATEGORY_SHORT_LABELS[category.id] ?? category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
