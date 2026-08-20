"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";

/**
 * Pins a compact search control while scrolling once the hero search
 * (or page top) leaves the viewport.
 */
export function StickySearchDock() {
  const pathname = usePathname();
  const hideDock =
    pathname === "/search" ||
    pathname.startsWith("/listings/");
  const [visible, setVisible] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandPath, setExpandPath] = useState(pathname);

  if (expandPath !== pathname) {
    setExpandPath(pathname);
    setExpanded(false);
    setFooterInView(false);
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

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY > 280);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hideDock, pathname]);

  useEffect(() => {
    if (hideDock) return;

    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [hideDock, pathname]);

  if (hideDock || !visible || footerInView) return null;

  return (
    <div
      aria-label="بحث ثابت"
      className="sticky-search-dock"
      data-expanded={expanded ? "true" : "false"}
    >
      {expanded ? (
        <form action="/search" className="sticky-search-dock__form motion-rise">
          <Icon className="sticky-search-dock__icon" name="search" size={18} />
          <input
            autoFocus
            aria-label="كلمة البحث"
            className="sticky-search-dock__input"
            name="q"
            placeholder="ابحث في سوقنا..."
            type="search"
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
