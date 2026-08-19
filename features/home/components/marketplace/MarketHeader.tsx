"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { VerifyAccountBanner } from "@/features/auth/components/VerifyAccountBanner";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { LanguageSwitch } from "@/shared/i18n/LanguageSwitch";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { useLocaleMessages } from "@/shared/i18n/useLocale";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import type { UserProfile } from "@/types";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketHeader() {
  const pathname = usePathname();
  const copy = useLocaleMessages();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { href: "/", icon: "home" as const, label: copy.home },
    { href: "/categories", icon: "grid" as const, label: copy.categories },
    { href: "/featured", icon: "star" as const, label: copy.featured },
    { href: "/escrow", icon: "shield" as const, label: copy.escrow },
    { href: "/search", icon: "search" as const, label: copy.explore },
  ];

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
    <LocalizedTree>
    <header className="market-header sticky top-0 z-50">
      <VerifyAccountBanner />
      <div className="market-header__accent" aria-hidden />
      <div className="app-container">
        <div className="market-header__bar">
          <BrandLogo showTagline={false} size="md" />

          <nav aria-label={copy.menu} className="market-header__nav">
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
            <LanguageSwitch
              className="market-header__lang market-header__bar-control--desktop"
              variant="compact"
            />
            <ThemeToggle className="market-header__icon-btn market-header__bar-control--desktop" />
            <NotificationBell
              badgeClassName="notify-bell__badge"
              className="market-header__icon-btn"
              iconSize={18}
            />

            {user ? (
              <Link
                aria-label={copy.account}
                className="market-header__icon-btn market-header__icon-btn--desktop"
                href="/profile"
              >
                <Icon name="user" size={18} />
              </Link>
            ) : (
              <Link className="market-header__join-link" href="/login">
                {copy.login}
              </Link>
            )}

            <Link className="market-header__cta hidden sm:inline-flex" href="/listings/new">
              <Icon name="plus" size={15} />
              <span>{copy.addListing}</span>
            </Link>

            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? copy.closeMenu : copy.menu}
              className="market-header__menu-btn lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav aria-label={copy.menu} className="market-header__drawer lg:hidden">
            <div className="market-header__drawer-top">
              <p className="market-header__drawer-eyebrow">{copy.browse}</p>
              <p className="market-header__drawer-title">{copy.browseTitle}</p>
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
                      <span className="market-header__drawer-now">{copy.current}</span>
                    ) : (
                      <Icon className="opacity-40" name="chevron-left" size={14} />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="market-header__drawer-settings">
              <LanguageSwitch />
              <div className="market-header__drawer-theme">
                <span>{copy.nightMode}</span>
                <ThemeToggle className="market-header__icon-btn" />
              </div>
            </div>

            <div className="market-header__drawer-footer">
              <Link
                className="market-header__drawer-account"
                href={user ? "/profile" : "/login"}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="user" size={16} />
                {user ? user.fullName.split(" ")[0] : copy.login}
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
                {copy.addListing}
              </Button>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
    </LocalizedTree>
  );
}
