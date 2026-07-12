"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

export function MobileHomeHeader() {
  const [city, setCity] = useState("دبي");

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/95 backdrop-blur-md">
      <div className="h-0.5 uae-header-accent" />
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            aria-label="القائمة"
            className="grid size-10 place-items-center rounded-xl text-ink transition hover:bg-surface-muted"
            type="button"
          >
            <Icon name="menu" size={22} />
          </button>
          <Link
            aria-label="الإشعارات"
            className="relative grid size-10 place-items-center rounded-xl text-ink transition hover:bg-surface-muted"
            href="/profile"
          >
            <Icon name="bell" size={20} />
            <span className="absolute start-2 top-1.5 grid min-w-[1rem] place-items-center rounded-full bg-error px-1 text-[0.55rem] font-black text-white">
              3
            </span>
          </Link>
        </div>

        <BrandLogo href="/" showTagline={false} size="sm" theme="light" variant="bilingual" />

        <label className="mobile-home-header__city inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1.5">
          <Icon className="text-secondary" name="map" size={14} />
          <select
            aria-label="الإمارة"
            className="max-w-[4.5rem] border-0 bg-transparent text-xs font-bold text-ink outline-none"
            onChange={(event) => setCity(event.target.value)}
            value={city}
          >
            {cities.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <Icon className="text-muted" name="chevron-left" size={12} />
        </label>
      </div>
    </header>
  );
}
