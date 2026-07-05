"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/shared/constants/navigation";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";
import type { UserProfile } from "@/types";

export function SiteHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncSession = () => setUser(getSessionUser());
    syncSession();
    window.addEventListener("uae-sales-session-change", syncSession);
    return () =>
      window.removeEventListener("uae-sales-session-change", syncSession);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-xl">
      <div className="app-container">
        <div className="flex min-h-[4rem] items-center justify-between gap-4">
          <Link className="flex shrink-0 items-center gap-2.5" href="/">
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-[var(--radius-xl)] bg-primary text-[0.65rem] font-semibold text-white">
              <span className="uae-flag-strip absolute inset-0 opacity-30" />
              <span className="relative">UAE</span>
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold tracking-tight text-ink">
                UAE Sales
              </span>
              <span className="block text-[0.65rem] font-medium text-secondary">
                سوق إماراتي فاخر
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-ink"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action="/search"
            className="hidden max-w-xs flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface-muted/60 px-3 md:flex"
          >
            <Icon className="text-muted" name="search" size={16} />
            <input
              aria-label="بحث سريع"
              className="min-h-10 w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/60"
              name="q"
              placeholder="ابحث..."
              type="search"
            />
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-muted sm:inline-flex"
                href="/profile"
              >
                {user.fullName.split(" ")[0]}
              </Link>
            ) : (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
                href="/login"
              >
                دخول
              </Link>
            )}
            <Button
              className="hidden !h-[42px] !min-h-[42px] !min-w-[120px] shrink-0 !justify-center !overflow-visible !rounded-full !px-[18px] whitespace-nowrap sm:inline-flex"
              href="/listings/new"
              size="sm"
              variant="primary"
            >
              <Icon name="plus" size={16} />
              أضف إعلانك
            </Button>
            <button
              aria-expanded={menuOpen}
              aria-label="القائمة"
              className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border text-ink lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-border py-4 lg:hidden">
            <div className="grid gap-1">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink transition hover:bg-surface-muted"
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <form action="/search" className="mt-2 px-1">
                <InputShell />
              </form>
              <Button
                className="mt-2 !h-[42px] !min-h-[42px] w-full !justify-center !overflow-visible !rounded-full !px-[18px] whitespace-nowrap"
                href="/listings/new"
                onClick={() => setMenuOpen(false)}
                variant="primary"
              >
                <Icon name="plus" size={16} />
                أضف إعلانك
              </Button>
              {user ? (
                <>
                  <Link
                    className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    حسابي
                  </Link>
                  <button
                    className="w-full rounded-[var(--radius-md)] px-4 py-3 text-right text-sm font-medium text-muted"
                    onClick={() => {
                      clearSessionUser();
                      setMenuOpen(false);
                    }}
                    type="button"
                  >
                    تسجيل الخروج
                  </button>
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
  );
}

function InputShell() {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
      <Icon className="text-muted" name="search" size={16} />
      <input
        aria-label="بحث"
        className="min-h-11 w-full bg-transparent text-sm outline-none"
        name="q"
        placeholder="ابحث عن أي شيء..."
        type="search"
      />
    </div>
  );
}
