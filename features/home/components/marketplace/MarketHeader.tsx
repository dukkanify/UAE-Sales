"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { EmirateLocationSelect } from "@/shared/components/EmirateLocationSelect";
import { LanguageSelect } from "@/shared/components/LanguageSelect";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { NotificationBell } from "@/shared/components/NotificationBell";
import { useT } from "@/shared/i18n/useLocale";
import type { MessageKey } from "@/shared/i18n/messages";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import type { UserProfile } from "@/types";

const nav = [
  { href: "/", icon: "home" as const, labelKey: "nav.home" as const },
  { href: "/categories", icon: "grid" as const, labelKey: "nav.categories" as const },
  { href: "/featured", icon: "star" as const, labelKey: "nav.featured" as const },
  { href: "/escrow", icon: "shield" as const, labelKey: "nav.escrow" as const },
  { href: "/search", icon: "search" as const, labelKey: "nav.search" as const },
] satisfies { href: string; icon: "home" | "grid" | "star" | "shield" | "search"; labelKey: MessageKey }[];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketHeader() {
  const pathname = usePathname();
  const t = useT();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="market-header sticky top-0 z-50">
      <div className="market-header__accent" aria-hidden />
      <div className="app-container">
        <div className="market-header__bar">
          <BrandLogo showTagline={false} size="md" />

          <nav aria-label={t("drawer.nav")} className="market-header__nav">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`market-header__nav-link${active ? " is-active" : ""}`}
                  href={item.href}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="market-header__actions">
            <EmirateLocationSelect
              className="market-header__location hidden lg:inline-flex"
              variant="desktop"
            />

            <LanguageSelect className="hidden lg:inline-flex" />

            <div className="market-header__cluster">
              <ThemeToggle className="market-header__icon-btn" />

              <Link
                aria-label={t("action.search")}
                className="market-header__icon-btn"
                href="/search"
              >
                <Icon name="search" size={18} />
              </Link>

              <NotificationBell className="market-header__icon-btn" iconSize={18} />

              {user ? (
                <Link
                  aria-label={t("action.account")}
                  className="market-header__icon-btn market-header__icon-btn--desktop"
                  href="/profile"
                >
                  <Icon name="user" size={18} />
                </Link>
              ) : (
                <Link className="market-header__join-link" href="/login">
                  {t("action.join")}
                </Link>
              )}
            </div>

            <Link className="market-header__cta hidden sm:inline-flex" href="/listings/new">
              <Icon name="plus" size={15} />
              <span>{t("action.addListing")}</span>
            </Link>

            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("action.closeMenu") : t("action.menu")}
              className="market-header__menu-btn lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav aria-label={t("drawer.mobileNav")} className="market-header__drawer lg:hidden">
            <div className="market-header__drawer-top">
              <div>
                <p className="market-header__drawer-eyebrow">{t("drawer.browse")}</p>
                <p className="market-header__drawer-title">{t("drawer.title")}</p>
              </div>
              <EmirateLocationSelect className="market-header__drawer-location" variant="mobile" />
            </div>

            <LanguageSelect className="mb-3" variant="drawer" />

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
                    <span className="flex-1 text-start">{t(item.labelKey)}</span>
                    {active ? (
                      <span className="market-header__drawer-now">{t("label.current")}</span>
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
                {user ? user.fullName.split(" ")[0] : t("action.join")}
              </Link>
              <Link
                className="market-header__drawer-account"
                href={user ? "/profile#notifications" : "/login"}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="bell" size={16} />
                {t("action.notifications")}
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
                {t("action.addListing")}
              </Button>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
