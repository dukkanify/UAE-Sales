"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";
import { SearchTypeahead } from "@/features/search/components/SearchTypeahead";

/**
 * Pins a compact search control while scrolling once the hero search
 * (or page top) leaves the viewport.
 */
export function StickySearchDock() {
  const pathname = usePathname();
  const hideDock =
    pathname === "/search" ||
    pathname.startsWith("/listings/new") ||
    /\/listings\/[^/]+\/edit$/.test(pathname) ||
    /\/listings\/local\/[^/]+\/edit$/.test(pathname);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandPath, setExpandPath] = useState(pathname);

  if (expandPath !== pathname) {
    setExpandPath(pathname);
    setExpanded(false);
  }

  useEffect(() => {
    if (hideDock) return;

    const anchor = document.querySelector("[data-search-anchor]");
    if (anchor) {
      const observer = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
      );
      observer.observe(anchor);
      return () => observer.disconnect();
    }

    const onScroll = () => setVisible(window.scrollY > 280);
    const frame = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [hideDock, pathname]);

  if (hideDock || !visible) return null;

  return (
    <div
      aria-label="بحث ثابت"
      className="sticky-search-dock"
      data-expanded={expanded ? "true" : "false"}
    >
      {expanded ? (
        <form action="/search" className="sticky-search-dock__form motion-rise">
          <Icon className="sticky-search-dock__icon" name="search" size={18} />
          <SearchTypeahead
            autoFocus
            hideIcon
            label=""
            name="q"
            placeholder="ابحث في سوقنا..."
            variant="dock"
          />
          <button className="sticky-search-dock__submit motion-press" type="submit">
            بحث
          </button>
          <button
            aria-label="إغلاق البحث"
            className="sticky-search-dock__close motion-press"
            onClick={() => setExpanded(false)}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </form>
      ) : (
        <button
          aria-label="فتح البحث"
          className="sticky-search-dock__fab motion-press"
          onClick={() => setExpanded(true)}
          type="button"
        >
          <Icon name="search" size={20} />
          <span>بحث</span>
        </button>
      )}
    </div>
  );
}
