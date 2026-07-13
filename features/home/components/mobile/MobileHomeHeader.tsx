"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND } from "@/shared/constants/brand";
import { primaryNavigation } from "@/shared/constants/navigation";
import { cities } from "@/shared/constants/locations";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { Icon } from "@/shared/ui/Icon";

export function MobileHomeHeader() {
  const [city, setCity] = useState("دبي");
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  const accountHref = user ? "/profile" : "/login";
  const accountLabel = user ? "حسابي" : "تسجيل الدخول";

  return (
    <header className="mobile-home-header">
      <div className="mobile-home-header__bar">
        <div className="mobile-home-header__side mobile-home-header__side--start">
          <button
            aria-expanded={menuOpen}
            aria-label="القائمة"
            className="mobile-home-header__icon-btn"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
          </button>
        </div>

        <Link
          aria-label={`${BRAND.nameAr} ${BRAND.nameEn}`}
          className="mobile-home-header__brand"
          href="/"
        >
          <BrandMark size={34} variant="default" />
          <span className="mobile-home-header__brand-text">
            <span className="mobile-home-header__brand-en">{BRAND.nameEn}</span>
            <span className="mobile-home-header__brand-ar">{BRAND.nameAr}</span>
          </span>
        </Link>

        <div className="mobile-home-header__side mobile-home-header__side--end">
          <div className="mobile-home-header__actions">
            <Link
              aria-label={accountLabel}
              className="mobile-home-header__icon-btn mobile-home-header__icon-btn--ghost mobile-home-header__icon-btn--account"
              href={accountHref}
              title={accountLabel}
            >
              <Icon name="user" size={19} />
            </Link>

            <Link
              aria-label="الإشعارات"
              className="mobile-home-header__icon-btn mobile-home-header__icon-btn--ghost mobile-home-header__icon-btn--badge"
              href="/profile"
            >
              <Icon name="bell" size={19} />
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
              <Icon className="mobile-home-header__chevron" name="chevron-left" size={11} />
            </label>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav className="mobile-home-header__drawer">
          <div className="mobile-home-header__drawer-inner">
            {user ? (
              <Link
                className="mobile-home-header__drawer-profile"
                href="/profile"
                onClick={() => setMenuOpen(false)}
              >
                <span className="mobile-home-header__drawer-profile-icon">
                  <Icon name="user" size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-[var(--mh-muted)]">حسابي</span>
                  <span className="block truncate text-sm font-bold text-ink">{user.fullName}</span>
                </span>
              </Link>
            ) : (
              <div className="mobile-home-header__drawer-auth">
                <Link
                  className="mobile-home-header__drawer-auth-primary"
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  className="mobile-home-header__drawer-auth-secondary"
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

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
