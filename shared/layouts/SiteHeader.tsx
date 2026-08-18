"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { primaryNavigation } from "@/shared/constants/navigation";
import { VerifyAccountBanner } from "@/features/auth/components/VerifyAccountBanner";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { SearchTypeahead } from "@/features/search/components/SearchTypeahead";
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

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
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
      <VerifyAccountBanner />
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
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form
            action="/search"
            className="relative hidden min-w-0 max-w-xs flex-1 md:block"
          >
            <SearchTypeahead
              compact
              label=""
              name="q"
              placeholder="ابحث..."
            />
          </form>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="shrink-0" />
            {user ? (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted sm:inline-flex"
                href="/profile"
              >
                حسابي
              </Link>
            ) : (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-primary transition hover:bg-secondary-soft sm:inline-flex"
                href="/login"
              >
                سجّل الدخول وانضم إلينا
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
                أضف إعلانك
              </Button>
            ) : null}
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
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
          <nav aria-label="قائمة الجوال" className="border-t border-border py-3 lg:hidden">
            <div className="mb-3 flex items-center justify-between rounded-[1.1rem] bg-gradient-to-l from-secondary/20 via-secondary-soft/50 to-transparent px-3 py-2.5">
              <p className="text-sm font-bold text-ink">تصفّح سوقنا</p>
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
                    <span className="flex-1 text-right">{item.label}</span>
                    {active ? (
                      <span className="text-[0.65rem] font-semibold text-secondary">الحالي</span>
                    ) : null}
                  </Link>
                );
              })}

              <form action="/search" className="mt-1 px-0.5">
                <InputShell />
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
                  أضف إعلانك
                </Button>
              ) : null}

              {user ? (
                <>
                  <Link
                    className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    حسابي
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
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Link
                  className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  تسجيل الدخول
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

function InputShell() {
  return (
    <SearchTypeahead
      compact
      label=""
      name="q"
      placeholder="ابحث عن أي شيء..."
    />
  );
}
