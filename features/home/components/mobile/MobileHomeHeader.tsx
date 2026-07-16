"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { EmirateLocationSelect } from "@/shared/components/EmirateLocationSelect";
import { primaryNavigation } from "@/shared/constants/navigation";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { Icon } from "@/shared/ui/Icon";

const drawerIcons: Record<string, "home" | "grid" | "shield"> = {
  "/": "home",
  "/categories": "grid",
  "/escrow": "shield",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileHomeHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);

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

        <div className="mobile-home-header__brand">
          <BrandLogo href="/" showTagline={false} size="sm" />
        </div>

        <div className="mobile-home-header__side mobile-home-header__side--end">
          <div className="mobile-home-header__actions">
            <Link
              aria-label="الإشعارات"
              className="mobile-home-header__notify"
              href="/profile"
            >
              <span className="mobile-home-header__notify-ring" aria-hidden />
              <Icon className="mobile-home-header__notify-icon" name="bell" size={19} />
              <span className="mobile-home-header__badge">3</span>
            </Link>

            <EmirateLocationSelect variant="mobile" />
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

            {primaryNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const icon = drawerIcons[item.href] ?? "grid";
              return (
                <Link
                  key={item.href}
                  className={`mobile-home-header__drawer-link${
                    active ? " mobile-home-header__drawer-link--active" : ""
                  }`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mobile-home-header__drawer-link-icon">
                    <Icon name={icon} size={16} />
                  </span>
                  <span className="mobile-home-header__drawer-link-label">{item.label}</span>
                </Link>
              );
            })}
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
