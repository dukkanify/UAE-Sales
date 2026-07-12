"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

export function MobileHomeHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("دبي");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-[var(--shadow-md)]">
      <div className="h-0.5 uae-header-accent" />
      <div className="px-4 pb-3 pt-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <BrandLogo href="/" showTagline={false} size="sm" theme="dark" variant="icon" />
          <div className="flex items-center gap-1">
            <span
              aria-hidden
              className="inline-flex size-9 items-center justify-center rounded-full text-white/90"
              title="العربية"
            >
              <span className="inline-block h-3.5 w-5 overflow-hidden rounded-sm uae-flag-strip" />
            </span>
            <Link
              aria-label="الإشعارات"
              className="relative grid size-9 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
              href="/profile"
            >
              <Icon name="bell" size={20} />
            </Link>
          </div>
        </div>

        <form className="mobile-home-search" onSubmit={handleSearch}>
          <label className="mobile-home-search__city">
            <Icon className="text-secondary" name="map" size={14} />
            <select
              aria-label="الإمارة"
              className="mobile-home-search__city-select"
              onChange={(event) => setCity(event.target.value)}
              value={city}
            >
              {cities.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <Icon className="text-white/60" name="chevron-left" size={12} />
          </label>
          <input
            className="mobile-home-search__input"
            name="q"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن..."
            type="search"
            value={query}
          />
          <button aria-label="بحث" className="mobile-home-search__submit" type="submit">
            <Icon name="search" size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
