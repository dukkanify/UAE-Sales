"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { primaryNavigation } from "@/shared/constants/navigation";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

export function MobileHomeHeader() {
  const [city, setCity] = useState("دبي");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="mobile-home-header">
      <div className="mobile-home-header__bar">
        <button
          aria-expanded={menuOpen}
          aria-label="القائمة"
          className="mobile-home-header__icon-btn"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <Icon className="shrink-0 text-[var(--mh-primary)]" name={menuOpen ? "close" : "menu"} size={22} />
        </button>

        <Link
          aria-label={`${BRAND.nameAr} ${BRAND.nameEn}`}
          className="mobile-home-header__logo"
          href="/"
        >
          <BrandMark size={32} variant="default" />
          <span className="mobile-home-header__logo-text">
            <span className="mobile-home-header__logo-en">{BRAND.nameEn}</span>
            <span className="mobile-home-header__logo-ar">{BRAND.nameAr}</span>
          </span>
        </Link>

        <div className="mobile-home-header__actions">
          <Link
            aria-label="الإشعارات"
            className="mobile-home-header__icon-btn mobile-home-header__icon-btn--badge"
            href="/profile"
          >
            <Icon name="bell" size={18} />
            <span className="mobile-home-header__badge">3</span>
          </Link>

          <label className="mobile-home-header__location">
            <Icon className="mobile-home-header__location-icon" name="map" size={14} />
            <span className="mobile-home-header__location-value">{city}</span>
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
        </div>
      </div>

      {menuOpen ? (
        <nav className="mobile-home-header__drawer">
          <div className="mobile-home-header__drawer-inner">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                className="mobile-home-header__drawer-link"
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="mobile-home-header__drawer-cta"
              href="/listings/new"
              onClick={() => setMenuOpen(false)}
            >
              <Icon name="plus" size={16} />
              أضف إعلانك
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
