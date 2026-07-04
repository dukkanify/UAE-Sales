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

export function FinalHeader() {
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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white shadow-[0_1px_0_rgb(15_20_25/4%)]">
      <div className="app-container">
        <div className="flex min-h-[4.75rem] items-center justify-between gap-6 md:min-h-[5rem]">
          <Link className="flex shrink-0 items-center gap-3" href="/">
            <span className="relative grid size-11 place-items-center overflow-hidden rounded-[var(--radius-xl)] bg-primary text-xs font-bold text-white md:size-12">
              <span className="uae-flag-strip absolute inset-0 opacity-30" />
              <span className="relative">UAE</span>
            </span>
            <span className="hidden sm:block">
              <span className="block text-base font-bold tracking-tight text-ink">
                UAE Sales
              </span>
              <span className="block text-xs font-medium text-muted">
                سوق إماراتي موثوق
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNavigation.map((item, index) => (
              <Link
                key={item.href}
                className={`rounded-[var(--radius-md)] px-4 py-2.5 transition hover:bg-surface-muted ${
                  index === 0
                    ? "text-sm font-bold text-ink"
                    : "text-sm font-medium text-muted hover:text-ink"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              aria-label="بحث"
              className="grid size-10 place-items-center rounded-[var(--radius-md)] text-muted transition hover:bg-surface-muted hover:text-ink md:size-11"
              href="/search"
            >
              <Icon name="search" size={21} />
            </Link>

            {user ? (
              <Link
                className="hidden rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
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
              className="hidden px-5 shadow-[0_4px_16px_rgb(15_20_25/12%)] sm:inline-flex"
              href="/listings/new"
              size="md"
              variant="primary"
            >
              <Icon name="plus" size={16} />
              أضف إعلان
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
              <Link
                className="rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-ink"
                href="/search"
                onClick={() => setMenuOpen(false)}
              >
                بحث
              </Link>
              <Button
                className="mt-2 w-full"
                href="/listings/new"
                onClick={() => setMenuOpen(false)}
                size="md"
                variant="primary"
              >
                <Icon name="plus" size={16} />
                أضف إعلان
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
