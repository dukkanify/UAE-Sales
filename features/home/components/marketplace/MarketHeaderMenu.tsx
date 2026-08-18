"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { EmirateLocationSelect } from "@/shared/components/EmirateLocationSelect";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import {
  MARKET_HEADER_NAV,
  isMarketHeaderPathActive,
} from "./market-header-nav";

type MarketHeaderMenuProps = {
  children: ReactNode;
};

export function MarketHeaderMenu({ children }: MarketHeaderMenuProps) {
  const pathname = usePathname();
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    const desktopNav = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktopNav.matches) setMenuOpen(false);
    };
    closeOnDesktop();
    desktopNav.addEventListener("change", closeOnDesktop);
    return () => desktopNav.removeEventListener("change", closeOnDesktop);
  }, []);

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
    <div className="app-container">
      <div className="market-header__bar">
        {children}
        <div className="market-header__actions">
          <EmirateLocationSelect className="market-header__location" variant="desktop" />

          <div className="market-header__cluster">
            <ThemeToggle className="market-header__icon-btn !size-[2.35rem] !min-h-0 !rounded-full !border-0 !shadow-none" />

            <Link aria-label="بحث" className="market-header__icon-btn" href="/search">
              <Icon name="search" size={18} />
            </Link>

            {user ? (
              <Link
                aria-label="حسابي"
                className="market-header__icon-btn market-header__icon-btn--desktop"
                href="/profile"
              >
                <Icon name="user" size={18} />
              </Link>
            ) : (
              <Link className="market-header__join-link" href="/login">
                سجّل الدخول وانضم إلينا
              </Link>
            )}
          </div>

          <Link className="market-header__cta" href="/listings/new">
            <Icon name="plus" size={15} />
            <span>أضف إعلانك</span>
          </Link>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "إغلاق القائمة" : "القائمة"}
            className="market-header__menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav aria-label="قائمة الجوال" className="market-header__drawer">
          <div className="market-header__drawer-top">
            <div>
              <p className="market-header__drawer-eyebrow">تصفّح سوقنا</p>
              <p className="market-header__drawer-title">كل الأقسام في مكان واحد</p>
            </div>
            <EmirateLocationSelect className="market-header__drawer-location" variant="mobile" />
          </div>

          <div className="market-header__drawer-grid">
            {MARKET_HEADER_NAV.map((item) => {
              const active = isMarketHeaderPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  className={`market-header__drawer-link${active ? " is-active" : ""}`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="market-header__drawer-icon">
                    <Icon name={item.icon} size={17} />
                  </span>
                  <span className="flex-1 text-start">{item.label}</span>
                  {active ? (
                    <span className="market-header__drawer-now">الحالي</span>
                  ) : (
                    <Icon className="opacity-40" name="chevron-left" size={14} />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="market-header__drawer-footer">
            <Link
              className="market-header__drawer-account"
              href={user ? "/profile" : "/login"}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name="user" size={16} />
              {user ? user.fullName.split(" ")[0] : "سجّل الدخول وانضم إلينا"}
            </Link>
            <Button
              className="sooqna-gold-gradient rounded-full"
              fullWidth
              href="/listings/new"
              onClick={() => setMenuOpen(false)}
              size="md"
              variant="accent"
            >
              <Icon name="plus" size={16} />
              أضف إعلانك
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
