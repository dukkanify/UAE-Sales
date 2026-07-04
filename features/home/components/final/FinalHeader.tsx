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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white">
      <div className="app-container">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-4">
          <Link className="flex shrink-0 items-center gap-2.5" href="/">
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-[var(--radius-lg)] bg-primary text-[0.65rem] font-semibold text-white">
              <span className="uae-flag-strip absolute inset-0 opacity-30" />
              <span className="relative">UAE</span>
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-semibold tracking-tight text-ink">
                UAE Sales
              </span>
              <span className="block text-[0.65rem] font-medium text-muted">
                سوق إماراتي موثوق
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              aria-label="بحث"
              className="grid size-10 place-items-center rounded-[var(--radius-md)] text-muted transition hover:bg-surface-muted hover:text-ink"
              href="/search"
            >
              <Icon name="search" size={20} />
            </Link>

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

            <Button className="hidden sm:inline-flex" href="/listings/new" size="sm" variant="primary">
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
                variant="primary"
              >
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
