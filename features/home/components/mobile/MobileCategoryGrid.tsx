"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Icon } from "@/shared/ui/Icon";
import {
  getMobileCategoryPages,
  MOBILE_MAIN_CATEGORY_LABELS,
} from "./mobile-home.config";

type MobileCategoryGridProps = {
  categories: Category[];
};

function getPageScrollLeft(track: HTMLElement, pageIndex: number): number {
  return pageIndex * track.clientWidth;
}

function getActivePageIndex(track: HTMLElement, pageCount: number): number {
  const pageWidth = track.clientWidth;
  if (pageWidth <= 0 || pageCount === 0) return 0;

  const index = Math.round(track.scrollLeft / pageWidth);
  return Math.min(Math.max(index, 0), pageCount - 1);
}

export function MobileCategoryGrid({ categories }: MobileCategoryGridProps) {
  const pages = getMobileCategoryPages(categories);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);

  const updateActivePage = useCallback(() => {
    const track = trackRef.current;
    if (!track || pages.length === 0) return;
    setActivePage(getActivePageIndex(track, pages.length));
  }, [pages.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    updateActivePage();
    track.addEventListener("scroll", updateActivePage, { passive: true });
    window.addEventListener("resize", updateActivePage);

    return () => {
      track.removeEventListener("scroll", updateActivePage);
      window.removeEventListener("resize", updateActivePage);
    };
  }, [updateActivePage]);

  const scrollToPage = (index: number) => {
    const track = trackRef.current;
    if (!track || pages.length === 0) return;

    const nextIndex = Math.min(Math.max(index, 0), pages.length - 1);
    track.scrollTo({
      behavior: "smooth",
      left: getPageScrollLeft(track, nextIndex),
    });
    setActivePage(nextIndex);
  };

  const canGoPrev = activePage > 0;
  const canGoNext = activePage < pages.length - 1;

  return (
    <section aria-label="التصنيفات" className="mobile-home-categories">
      <div
        ref={trackRef}
        className="mobile-home-categories__track mobile-home-scroll"
      >
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="mobile-home-categories__page">
            {page.map((category) => (
              <Link
                key={category.id}
                className="mobile-home-categories__card"
                href={`/categories/${category.slug}`}
              >
                <span className="mobile-home-categories__icon">
                  <CategoryIcon
                    category={category}
                    className="mobile-home-categories__icon-svg"
                    size={28}
                  />
                </span>
                <span className="mobile-home-categories__label">
                  {MOBILE_MAIN_CATEGORY_LABELS[category.id] ?? category.name}
                </span>
              </Link>
            ))}

            {pageIndex === pages.length - 1 ? (
              <Link className="mobile-home-categories__card" href="/categories">
                <span className="mobile-home-categories__icon mobile-home-categories__icon--more">
                  <Icon className="mobile-home-categories__icon-svg" name="grid" size={26} />
                </span>
                <span className="mobile-home-categories__label">المزيد</span>
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div className="mobile-home-categories__controls">
          <button
            aria-label="الصفحة السابقة"
            className="mobile-home-categories__arrow"
            disabled={!canGoPrev}
            onClick={() => scrollToPage(activePage - 1)}
            type="button"
          >
            <Icon name="chevron-right" size={18} />
          </button>

          <div className="mobile-home-categories__dots" aria-label="صفحات التصنيفات">
            {pages.map((_, index) => (
              <button
                key={index}
                aria-current={activePage === index ? "true" : undefined}
                aria-label={`صفحة ${index + 1}`}
                className={`mobile-home-categories__dot ${
                  activePage === index ? "mobile-home-categories__dot--active" : ""
                }`}
                onClick={() => scrollToPage(index)}
                type="button"
              />
            ))}
          </div>

          <button
            aria-label="الصفحة التالية"
            className="mobile-home-categories__arrow"
            disabled={!canGoNext}
            onClick={() => scrollToPage(activePage + 1)}
            type="button"
          >
            <Icon name="chevron-left" size={18} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
