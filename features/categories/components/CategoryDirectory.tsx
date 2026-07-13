"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
import { DragScrollRow } from "@/shared/components/DragScrollRow";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import "./category-directory.css";

type CategoryDirectoryProps = {
  categories: Category[];
};

function CategorySubcategories({ category }: { category: Category }) {
  const subcategories = category.subcategories.slice(0, 6);
  if (subcategories.length === 0) return null;

  return (
    <DragScrollRow
      ariaLabel={`تصنيفات فرعية لـ ${category.name}`}
      className="category-directory-card__subs mobile-home-scroll"
    >
      {subcategories.map((subcategory) => (
        <Link
          key={subcategory}
          className="category-directory-card__sub"
          href={`/categories/${category.slug}?q=${encodeURIComponent(subcategory)}`}
        >
          {subcategory}
        </Link>
      ))}
    </DragScrollRow>
  );
}

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  return (
    <div>
      <section aria-label="وصول سريع للأقسام" className="category-directory-quick">
        <DragScrollRow
          ariaLabel="وصول سريع للأقسام"
          className="category-directory-quick__track mobile-home-scroll"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              className="category-directory-quick__item"
              href={`/categories/${category.slug}`}
            >
              <CategoryThumbnail category={category} variant="compact" />
              <span className="category-directory-quick__label">{category.name}</span>
            </Link>
          ))}
        </DragScrollRow>
      </section>

      <div className="category-directory-grid">
        {categories.map((category) => (
          <article key={category.id} className="category-directory-card">
            <Link className="category-directory-card__hero" href={`/categories/${category.slug}`}>
              <div className="category-directory-card__hero-media">
                <AppImage
                  alt=""
                  aria-hidden
                  className="object-cover"
                  fallbackCategory={category.id}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={category.imageUrl}
                />
              </div>
              <div aria-hidden className="category-directory-card__hero-overlay" />
              <div className="category-directory-card__hero-content">
                <div className="category-directory-card__hero-main">
                  <CategoryThumbnail
                    category={category}
                    className="mx-0 shrink-0"
                    variant="compact"
                  />
                  <h2 className="category-directory-card__title">{category.name}</h2>
                </div>
                <span className="category-directory-card__count">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </span>
              </div>
            </Link>

            <div className="category-directory-card__body">
              {category.featuredListingSlug ? (
                <Link
                  className="category-directory-card__featured"
                  href={`/listings/${category.featuredListingSlug}`}
                >
                  <Icon aria-hidden name="star" size={12} />
                  إعلان مميز في هذا القسم
                  <Icon aria-hidden name="arrow-left" size={12} />
                </Link>
              ) : null}

              <CategorySubcategories category={category} />

              <div className="category-directory-card__footer">
                <span className="category-directory-card__meta">
                  {category.subcategories.length.toLocaleString("ar-AE")} تصنيف فرعي
                </span>
                <Link
                  className="category-directory-card__cta"
                  href={`/categories/${category.slug}`}
                >
                  عرض الكل
                  <Icon aria-hidden name="arrow-left" size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
