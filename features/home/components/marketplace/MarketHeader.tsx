"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { EmirateLocationSelect } from "@/shared/components/EmirateLocationSelect";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import type { UserProfile } from "@/types";

const nav = [
  { href: "/", icon: "home" as const, label: "الرئيسية" },
  { href: "/categories", icon: "grid" as const, label: "التصنيفات" },
  { href: "/featured", icon: "star" as const, label: "المميزة" },
  { href: "/escrow", icon: "shield" as const, label: "الضمان" },
  { href: "/search", icon: "search" as const, label: "استكشف" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  return (
    <header className="market-header sticky top-0 z-50">
      <div className="market-header__accent" aria-hidden />
      <div className="app-container">
        <div className="market-header__bar">
          <BrandLogo showTagline={false} size="md" />

          <nav aria-label="التنقل الرئيسي" className="market-header__nav">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`market-header__nav-link${active ? " is-active" : ""}`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="market-header__actions">
            <EmirateLocationSelect
              className="market-header__location hidden lg:inline-flex"
              variant="desktop"
            />

            <div className="market-header__cluster">
              <ThemeToggle className="market-header__icon-btn hidden sm:grid" />

              <Link
                aria-label="بحث"
                className="market-header__icon-btn"
                href="/search"
              >
                <Icon name="search" size={18} />
              </Link>

              <Link
                aria-label={user ? "حسابي" : "تسجيل الدخول"}
                className="market-header__icon-btn hidden sm:grid"
                href={user ? "/profile" : "/login"}
              >
                <Icon name="user" size={18} />
              </Link>

              <ThemeToggle className="market-header__icon-btn sm:hidden" />
            </div>

            <Link className="market-header__cta hidden sm:inline-flex" href="/listings/new">
              <Icon name="plus" size={15} />
              <span>أضف إعلانك</span>
            </Link>

            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "إغلاق القائمة" : "القائمة"}
              className="market-header__menu-btn lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav aria-label="قائمة الجوال" className="market-header__drawer lg:hidden">
            <div className="market-header__drawer-top">
              <div>
                <p className="market-header__drawer-eyebrow">تصفّح سوقنا</p>
                <p className="market-header__drawer-title">كل الأقسام في مكان واحد</p>
              </div>
              <EmirateLocationSelect className="market-header__drawer-location" variant="mobile" />
            </div>

            <div className="market-header__drawer-grid">
              {nav.map((item) => {
                const active = isActivePath(pathname, item.href);
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
                {user ? user.fullName.split(" ")[0] : "تسجيل الدخول"}
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
    </header>
  );
}
