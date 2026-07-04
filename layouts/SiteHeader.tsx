"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/constants/navigation";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/clientStorage";
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur-2xl">
      <div className="app-container">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-4">
          <Link className="flex shrink-0 items-center gap-3" href="/">
            <span className="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-primary text-xs font-black text-white shadow-[var(--shadow-sm)]">
              <span className="uae-flag-strip absolute inset-0 opacity-40" />
              <span className="relative">UAE</span>
            </span>
            <span className="hidden sm:block">
              <span className="block text-base font-black tracking-tight text-ink">
                UAE Sales
              </span>
              <span className="block text-[0.7rem] font-bold text-secondary">
                سوق إماراتي فاخر
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                className="rounded-lg px-3.5 py-2 text-sm font-bold text-muted transition hover:bg-surface-muted hover:text-ink"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action="/search"
            className="hidden max-w-xs flex-1 items-center gap-2 rounded-xl border border-border bg-surface-muted/60 px-3 md:flex"
          >
            <span aria-hidden className="text-muted">
              ⌕
            </span>
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
                className="hidden rounded-xl px-3.5 py-2 text-sm font-bold text-ink transition hover:bg-surface-muted sm:inline-flex"
                href="/profile"
              >
                {user.fullName.split(" ")[0]}
              </Link>
            ) : (
              <Link
                className="hidden rounded-xl px-3.5 py-2 text-sm font-bold text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
                href="/login"
              >
                دخول
              </Link>
            )}
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-[var(--shadow-sm)] transition hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
              href="/listings/new"
            >
              أضف إعلان
            </Link>
            <button
              aria-expanded={menuOpen}
              aria-label="القائمة"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-ink lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-border py-4 lg:hidden">
            <div className="grid gap-1">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-ink transition hover:bg-surface-muted"
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <form action="/search" className="mt-2 px-1">
                <input
                  aria-label="بحث"
                  className="focus-ring w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                  name="q"
                  placeholder="ابحث عن أي شيء..."
                  type="search"
                />
              </form>
              {user ? (
                <>
                  <Link
                    className="rounded-xl px-4 py-3 text-sm font-bold text-ink"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    حسابي
                  </Link>
                  <button
                    className="w-full rounded-xl px-4 py-3 text-right text-sm font-bold text-muted"
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
                  className="rounded-xl px-4 py-3 text-sm font-bold text-ink"
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
