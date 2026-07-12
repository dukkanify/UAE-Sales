import Link from "next/link";
import type { Category } from "@/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import {
  getMobileMainCategories,
  MOBILE_MAIN_CATEGORY_LABELS,
} from "./mobile-home.config";
import { MobileSectionHeader } from "./MobileSectionHeader";

type MobileCategoryGridProps = {
  categories: Category[];
};

export function MobileCategoryGrid({ categories }: MobileCategoryGridProps) {
  const items = getMobileMainCategories(categories);

  return (
    <section aria-label="التصنيفات الرئيسية" className="mobile-home-categories">
      <MobileSectionHeader actionHref="/categories" title="التصنيفات الرئيسية" />
      <div className="mobile-home-categories__track mobile-home-scroll">
        {items.map((category) => (
          <Link
            key={category.id}
            className="mobile-home-categories__card"
            href={`/categories/${category.slug}`}
          >
            <span className="mobile-home-categories__icon">
              <CategoryIcon category={category} className="text-[var(--mh-gold)]" size={28} />
            </span>
            <span className="mobile-home-categories__label">
              {MOBILE_MAIN_CATEGORY_LABELS[category.id] ?? category.name}
            </span>
          </Link>
        ))}
      </div>
      <div className="mobile-home-categories__dots">
        <span className="mobile-home-categories__dot mobile-home-categories__dot--active" />
        <span className="mobile-home-categories__dot" />
        <span className="mobile-home-categories__dot" />
        <span className="mobile-home-categories__dot" />
        <span className="mobile-home-categories__dot" />
      </div>
    </section>
  );
}
