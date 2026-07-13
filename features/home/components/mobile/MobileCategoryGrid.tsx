"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/types";
import {
  getMobileCategoryPages,
  MOBILE_MAIN_CATEGORY_LABELS,
} from "./mobile-home.config";
import { MobileCategoryTile } from "./MobileCategoryTile";

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

  return (
    <section aria-label="التصنيفات" className="mobile-home-categories">
      <div
        ref={trackRef}
        className="mobile-home-categories__track mobile-home-scroll"
      >
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="mobile-home-categories__page">
            {page.map((category) => (
              <MobileCategoryTile
                key={category.id}
                category={category}
                href={`/categories/${category.slug}`}
                label={MOBILE_MAIN_CATEGORY_LABELS[category.id] ?? category.name}
              />
            ))}

            {pageIndex === pages.length - 1 ? (
              <MobileCategoryTile href="/categories" label="المزيد" variant="more" />
            ) : null}
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div className="mobile-home-categories__indicator">
          <button
            aria-label="تصفح صفحات التصنيفات"
            className="mobile-home-categories__indicator-track"
            onClick={() => scrollToPage(activePage === 0 ? 1 : 0)}
            type="button"
          >
            <span
              aria-hidden
              className="mobile-home-categories__indicator-fill"
              style={{
                width: `${100 / pages.length}%`,
                transform: `translateX(${activePage * 100}%)`,
              }}
            />
          </button>
        </div>
      ) : null}
    </section>
  );
}
