"use client";

import Link from "next/link";
import { useRef } from "react";
import { Icon } from "@/shared/ui/Icon";
import { MOBILE_TRENDING_SEARCHES } from "./mobile-home.config";
import { MobileSectionHeader } from "./MobileSectionHeader";

export function MobileTrendingSearches() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollNext() {
    trackRef.current?.scrollBy({ behavior: "smooth", left: -160 });
  }

  return (
    <section aria-label="الأكثر بحثاً" className="mobile-home-trending">
      <MobileSectionHeader icon="chart" title="الأكثر بحثاً" />
      <div className="mobile-home-trending__track">
        <div ref={trackRef} className="mobile-home-trending__pills mobile-home-scroll">
          {MOBILE_TRENDING_SEARCHES.map((item) => (
            <Link
              key={item.href}
              className="mobile-home-trending__pill"
              href={item.href}
            >
              <span>{item.label}</span>
              <span aria-hidden>{item.emoji}</span>
            </Link>
          ))}
        </div>
        <button
          aria-label="تمرير المزيد"
          className="mobile-home-trending__scroll-btn"
          onClick={scrollNext}
          type="button"
        >
          <Icon name="chevron-left" size={16} />
        </button>
      </div>
    </section>
  );
}
