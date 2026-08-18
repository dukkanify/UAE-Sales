"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { LanguageSelect } from "@/shared/components/LanguageSelect";
import { primaryNavigation } from "@/shared/constants/navigation";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { SearchTypeahead } from "@/features/search/components/SearchTypeahead";
import { NotificationBell } from "@/shared/components/NotificationBell";
import { useT } from "@/shared/i18n/useLocale";
import type { MessageKey } from "@/shared/i18n/messages";
import { ThemeToggle } from "@/shared/theme/ThemeToggle";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";
import { removeSessionCookie } from "@/services/auth/session-sync";
import type { UserProfile } from "@/types";

const StickySearchDock = dynamic(
  () =>
    import("@/features/search/components/StickySearchDock").then(
      (mod) => mod.StickySearchDock,
    ),
  { ssr: false },
);

const drawerIcons: Record<string, "home" | "grid" | "shield"> = {
  "/": "home",
  "/categories": "grid",
  "/escrow": "shield",
};

const navKeys: Record<string, MessageKey> = {
  "/": "nav.home",
  "/categories": "nav.categories",
  "/escrow": "nav.escrow",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const t = useT();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isComposeListing = pathname.startsWith("/listings/new");

  useEffect(() => {
    const syncSession = () => setUser(getSessionUser());
    syncSession();
    window.addEventListener(STORAGE_EVENTS.sessionChange, syncSession);
    return () =>
      window.removeEventListener(STORAGE_EVENTS.sessionChange, syncSession);
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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-xl">
      <div className="sooqna-header-accent h-0.5" />
      <div className="app-container">
        <div className="flex min-h-[4rem] items-center justify-between gap-4">
          <BrandLogo showTagline={false} size="sm" />

          <nav className="hidden items-center gap-0.5 lg:flex">
            {primaryNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  className={`rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary-soft text-ink"
                      : "text-muted hover:bg-surface-muted hover:text-ink"
                  }`}
                  href={item.href}
                >
                  {t(navKeys[item.href] ?? "nav.home")}
                </Link>
              );
            })}
          </nav>

          <form
            action="/search"
            className="relative hidden max-w-xs flex-1 md:block"
          >
            <SearchTypeahead
              compact
              label=""
              name="q"
              placeholder={t("search.placeholderShort")}
            />
          </form>

          <div className="flex items-center gap-2">
            <LanguageSelect className="hidden sm:inline-flex" />
            <ThemeToggle />
            <NotificationBell
              className="focus-ring relative grid size-10 shrink-0 place-items-center rounded-[var(--radius-xl)] border border-border bg-surface text-ink shadow-[var(--shadow-xs)] transition hover:border-secondary/50"
              iconSize={18}
            />
            {user ? (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted sm:inline-flex"
                href="/profile"
              >
                {t("action.account")}
              </Link>
            ) : (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-primary transition hover:bg-secondary-soft sm:inline-flex"
                href="/login"
              >
                {t("action.join")}
              </Link>
            )}
            {!isComposeListing ? (
              <Button
                className="sooqna-gold-gradient hidden rounded-full sm:inline-flex"
                href="/listings/new"
                size="md"
                variant="accent"
              >
                <Icon className="shrink-0" name="plus" size={16} />
                {t("action.addListing")}
              </Button>
            ) : null}
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("action.closeMenu") : t("action.menu")}
              className="focus-ring motion-press grid size-11 shrink-0 place-items-center overflow-visible rounded-[var(--radius-xl)] border border-border bg-surface text-primary shadow-[var(--shadow-xs)] transition hover:border-secondary/50 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon
                className="shrink-0 text-primary"
                name={menuOpen ? "close" : "menu"}
                size={22}
              />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav aria-label={t("drawer.mobileNav")} className="border-t border-border py-3 lg:hidden">
            <div className="mb-3 flex items-center justify-between rounded-[1.1rem] bg-gradient-to-l from-secondary/20 via-secondary-soft/50 to-transparent px-3 py-2.5">
              <p className="text-sm font-bold text-ink">{t("drawer.browse")}</p>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-bold text-[#0b1628]">
                {t("label.sections")}
              </span>
            </div>
            <div className="mb-3">
              <LanguageSelect variant="drawer" />
            </div>

            <div className="grid gap-1.5">
              {primaryNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                const icon = drawerIcons[item.href] ?? "grid";
                return (
                  <Link
                    key={item.href}
                    className={`flex items-center gap-3 rounded-[1rem] px-3 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-[#0b1628] text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)]"
                        : "bg-surface-muted/70 text-ink hover:bg-secondary-soft/70"
                    }`}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                        active ? "bg-white/15 text-secondary" : "bg-surface text-primary"
                      }`}
                    >
                      <Icon name={icon} size={18} />
                    </span>
                    <span className="flex-1 text-start">{t(navKeys[item.href] ?? "nav.home")}</span>
                    {active ? (
                      <span className="text-[0.65rem] font-semibold text-secondary">{t("label.current")}</span>
                    ) : null}
                  </Link>
                );
              })}

              <form action="/search" className="mt-1 px-0.5">
                <InputShell placeholder={t("search.placeholder")} />
              </form>

              {!isComposeListing ? (
                <Button
                  className="sooqna-gold-gradient mt-1 rounded-full"
                  fullWidth
                  href="/listings/new"
                  onClick={() => setMenuOpen(false)}
                  size="md"
                  variant="accent"
                >
                  <Icon className="shrink-0" name="plus" size={16} />
                  {t("action.addListing")}
                </Button>
              ) : null}

              {user ? (
                <>
                  <Link
                    className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("action.account")}
                  </Link>
                  <Link
                    className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                    href="/profile#notifications"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("action.notifications")}
                  </Link>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      clearSessionUser();
                      void removeSessionCookie();
                      setMenuOpen(false);
                    }}
                    type="button"
                    variant="ghost"
                  >
                    {t("action.logout")}
                  </Button>
                </>
              ) : (
                <Link
                  className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("action.login")}
                </Link>
              )}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
    <StickySearchDock />
    </>
  );
}

function InputShell({ placeholder }: { placeholder: string }) {
  return (
    <SearchTypeahead
      compact
      label=""
      name="q"
      placeholder={placeholder}
    />
  );
}
