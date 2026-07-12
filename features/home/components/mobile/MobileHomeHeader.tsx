"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

export function MobileHomeHeader() {
  const [city, setCity] = useState("دبي");

  return (
    <header className="mobile-home-header">
      <div className="mobile-home-header__bar">
        <label className="mobile-home-header__location">
          <Icon className="mobile-home-header__location-icon" name="map" size={14} />
          <select
            aria-label="الإمارة"
            className="mobile-home-header__location-select"
            onChange={(event) => setCity(event.target.value)}
            value={city}
          >
            {cities.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <Icon className="mobile-home-header__chevron" name="chevron-left" size={12} />
        </label>

        <Link
          aria-label={`${BRAND.nameAr} ${BRAND.nameEn}`}
          className="mobile-home-header__logo"
          href="/"
        >
          <BrandMark size={30} variant="gold" />
          <span className="mobile-home-header__logo-text">
            <span className="mobile-home-header__logo-en">{BRAND.nameEn}</span>
            <span className="mobile-home-header__logo-ar">{BRAND.nameAr}</span>
          </span>
        </Link>

        <div className="mobile-home-header__actions">
          <button
            aria-label="القائمة"
            className="mobile-home-header__icon-btn"
            type="button"
          >
            <Icon className="shrink-0 text-[var(--mh-primary)]" name="menu" size={22} />
          </button>
          <Link
            aria-label="الإشعارات"
            className="mobile-home-header__icon-btn mobile-home-header__icon-btn--badge"
            href="/profile"
          >
            <Icon name="bell" size={18} />
            <span className="mobile-home-header__badge">3</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
