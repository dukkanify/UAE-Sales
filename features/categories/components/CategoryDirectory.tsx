"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { DragScrollRow } from "@/shared/components/DragScrollRow";
import { Icon } from "@/shared/ui/Icon";
import "./category-directory.css";

type CategoryDirectoryProps = {
  categories: Category[];
};

function CategorySubcategories({ category }: { category: Category }) {
  const subcategories = category.subcategories.slice(0, 5);
  if (subcategories.length === 0) return null;

  return (
    <DragScrollRow
      ariaLabel={`تصنيفات فرعية لـ ${category.name}`}
      className="category-directory-card__subs"
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
  if (categories.length === 0) {
    return (
      <div className="category-directory-empty">
        <p>لا توجد أقسام متاحة حالياً.</p>
      </div>
    );
  }

  return (
    <div className="category-directory">
      <section aria-label="وصول سريع للأقسام" className="category-directory-quick">
        <DragScrollRow
          ariaLabel="وصول سريع للأقسام"
          className="category-directory-quick__track"
        >
          {categories.map((category) => (
            <Link
              key={`quick-${category.id}`}
              className="category-directory-quick__item"
              href={`/categories/${category.slug}`}
            >
              <span className="category-directory-quick__thumb">
                <AppImage
                  alt={category.name}
                  className="object-cover"
                  fallbackCategory={category.id}
                  fill
                  sizes="64px"
                  src={category.imageUrl}
                />
              </span>
              <span className="category-directory-quick__label">{category.name}</span>
            </Link>
          ))}
        </DragScrollRow>
      </section>

      <div className="category-directory-grid">
        {categories.map((category) => (
          <article key={category.id} className="category-directory-card">
            <Link
              className="category-directory-card__hero"
              href={`/categories/${category.slug}`}
            >
              <span className="category-directory-card__hero-media">
                <AppImage
                  alt={category.name}
                  className="object-cover"
                  fallbackCategory={category.id}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={category.imageUrl}
                />
              </span>
              <span aria-hidden className="category-directory-card__hero-overlay" />
              <span className="category-directory-card__hero-content">
                <span className="category-directory-card__title-wrap">
                  <span className="category-directory-card__thumb">
                    <AppImage
                      alt=""
                      className="object-cover"
                      fallbackCategory={category.id}
                      fill
                      sizes="56px"
                      src={category.imageUrl}
                    />
                  </span>
                  <h2 className="category-directory-card__title">{category.name}</h2>
                </span>
                <span className="category-directory-card__count">
                  {category.listingCount.toLocaleString("ar-AE")} إعلان
                </span>
              </span>
            </Link>

            <div className="category-directory-card__body">
              {category.featuredListingSlug ? (
                <Link
                  className="category-directory-card__featured"
                  href={`/listings/${category.featuredListingSlug}`}
                >
                  <Icon aria-hidden name="star" size={12} />
                  إعلان مميز في هذا القسم
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
