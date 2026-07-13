import Link from "next/link";
import type { Category } from "@/types";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
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
      <div className="mobile-home-categories__grid">
        {items.map((category) => (
          <Link
            key={category.id}
            className="mobile-home-categories__card"
            href={`/categories/${category.slug}`}
          >
            <CategoryThumbnail category={category} size="md" />
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
