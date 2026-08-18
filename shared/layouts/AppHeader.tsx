"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category, UserProfile } from "@/types";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { EmirateLocationSelect } from "@/shared/components/EmirateLocationSelect";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { mockCategories } from "@/mock/categories.mock";
import { SearchTypeahead } from "@/features/search/components/SearchTypeahead";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import {
  HeaderCategoryAccordion,
  HeaderCategoryMega,
  HeaderCategoryRail,
} from "@/shared/layouts/HeaderCategoryNav";
import { fetchHeaderCategories } from "@/shared/layouts/header-nav";

const StickySearchDock = dynamic(
  () =>
    import("@/features/search/components/StickySearchDock").then(
      (mod) => mod.StickySearchDock,
    ),
  { ssr: false },
);

type AppHeaderProps = {
  categories?: Category[];
  showStickySearch?: boolean;
};

export function AppHeader({
  categories: initialCategories,
  showStickySearch = true,
}: AppHeaderProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState<Category[] | null>(null);
  const categories = initialCategories?.length
    ? initialCategories
    : fetchedCategories ?? mockCategories;
  const isComposeListing = pathname.startsWith("/listings/new");

  useEffect(() => {
    if (initialCategories?.length) return;
    let cancelled = false;
    fetchHeaderCategories(mockCategories).then((next) => {
      if (!cancelled) setFetchedCategories(next);
    });
    return () => {
      cancelled = true;
    };
  }, [initialCategories]);

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

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
    <>
      <header className="app-header">
        <div className="app-header__accent" aria-hidden />
        <div className="app-container app-header__inner">
          <div className="app-header__bar">
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "إغلاق القائمة" : "القائمة"}
              className="app-header__menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={18} />
            </button>

            <span className="app-header__logo-mobile">
              <BrandLogo showTagline={false} size="sm" />
            </span>
            <span className="app-header__logo-desktop">
              <BrandLogo showTagline={false} size="md" />
            </span>

            <form action="/search" className="app-header__search">
              <SearchTypeahead
                compact
                label=""
                name="q"
                placeholder="ابحث في سوقنا..."
              />
            </form>

            <div className="app-header__actions">
              <EmirateLocationSelect
                className="app-header__location"
                variant="desktop"
              />
              <ThemeToggle className="app-header__theme" />
              {user ? (
                <Link
                  aria-label="حسابي"
                  className="app-header__icon-btn"
                  href="/profile"
                >
                  <Icon name="user" size={17} />
                </Link>
              ) : (
                <Link className="app-header__login" href="/login">
                  <span className="app-header__login-short">دخول</span>
                  <span className="app-header__login-full">سجّل الدخول</span>
                </Link>
              )}
              {!isComposeListing ? (
                <Link className="app-header__cta" href="/listings/new">
                  <Icon name="plus" size={15} />
                  <span>أضف إعلانك</span>
                </Link>
              ) : null}
            </div>
          </div>

          <HeaderCategoryMega categories={categories} />
          <HeaderCategoryRail categories={categories} />

          {menuOpen ? (
            <nav aria-label="قائمة الجوال" className="app-header__drawer">
              <div className="app-header__drawer-top">
                <EmirateLocationSelect
                  className="app-header__drawer-location"
                  variant="desktop"
                />
                <ThemeToggle />
              </div>

              <Link
                className="app-header__drawer-account"
                href={user ? "/profile" : "/login"}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="user" size={16} />
                <span>{user ? user.fullName.split(" ")[0] : "سجّل الدخول"}</span>
                <Icon className="opacity-40" name="chevron-left" size={14} />
              </Link>

              <HeaderCategoryAccordion
                categories={categories}
                onNavigate={() => setMenuOpen(false)}
              />

              <div className="app-header__drawer-links">
                <Link href="/featured" onClick={() => setMenuOpen(false)}>
                  المميزة
                </Link>
                <Link href="/escrow" onClick={() => setMenuOpen(false)}>
                  الضمان
                </Link>
                <Link href="/search" onClick={() => setMenuOpen(false)}>
                  استكشف
                </Link>
              </div>

              {!isComposeListing ? (
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
              ) : null}
            </nav>
          ) : null}
        </div>
      </header>
      {showStickySearch ? <StickySearchDock /> : null}
    </>
  );
}
