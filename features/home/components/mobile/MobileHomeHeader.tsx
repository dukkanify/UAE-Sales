"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { EmirateLocationSelect } from "@/shared/components/EmirateLocationSelect";
import { primaryNavigation } from "@/shared/constants/navigation";
import { VerifyAccountBanner } from "@/features/auth/components/VerifyAccountBanner";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Icon } from "@/shared/ui/Icon";

const drawerIcons: Record<string, "home" | "grid" | "shield" | "star" | "search"> = {
  "/": "home",
  "/categories": "grid",
  "/escrow": "shield",
  "/featured": "star",
  "/search": "search",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileHomeHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="mobile-home-header">
      <VerifyAccountBanner />
      <div className="mobile-home-header__bar">
        <div className="mobile-home-header__side mobile-home-header__side--start">
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "إغلاق القائمة" : "القائمة"}
            className="mobile-home-header__icon-btn"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={19} />
          </button>
        </div>

        <div className="mobile-home-header__brand">
          <BrandLogo href="/" showTagline={false} size="sm" />
        </div>

        <div className="mobile-home-header__side mobile-home-header__side--end">
          <div className="mobile-home-header__cluster">
            <Link
              aria-label="بحث"
              className="mobile-home-header__icon-btn"
              href="/search"
            >
              <Icon name="search" size={17} />
            </Link>

            <ThemeToggle className="mobile-home-header__icon-btn mobile-home-header__theme-toggle" />

            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="mobile-home-header__smart-row">
        <EmirateLocationSelect variant="mobile" />
        <Link className="mobile-home-header__quick-search" href="/search">
          <Icon name="search" size={14} />
          <span>ابحث في سوقنا...</span>
        </Link>
      </div>

      {menuOpen ? (
        <nav className="mobile-home-header__drawer">
          <div className="mobile-home-header__drawer-inner">
            <Link
              className="mobile-home-header__drawer-profile"
              href={user ? "/profile" : "/login"}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-home-header__drawer-profile-icon">
                <Icon name="user" size={18} />
              </span>
              <span className="mobile-home-header__drawer-profile-copy">
                <span className="mobile-home-header__drawer-profile-eyebrow">حسابي</span>
                <span className="mobile-home-header__drawer-profile-name">
                  {user ? user.fullName : "سجّل الدخول للمتابعة"}
                </span>
              </span>
              <span className="mobile-home-header__drawer-profile-action">
                {user ? "الملف" : "دخول"}
                <Icon name="chevron-left" size={14} />
              </span>
            </Link>

            {!user ? (
              <Link
                className="mobile-home-header__drawer-register"
                href="/register"
                onClick={() => setMenuOpen(false)}
              >
                ليس لديك حساب؟ <span>إنشاء حساب</span>
              </Link>
            ) : null}

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
            <div className="mobile-home-header__drawer-theme">
              <span>الوضع الليلي</span>
              <ThemeToggle className="mobile-home-header__icon-btn mobile-home-header__theme-toggle" />
            </div>
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
