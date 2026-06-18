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

  useEffect(() => {
    const syncSession = () => setUser(getSessionUser());

    syncSession();
    window.addEventListener("uae-sales-session-change", syncSession);

    return () =>
      window.removeEventListener("uae-sales-session-change", syncSession);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="app-container">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2 lg:flex-nowrap">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid size-12 place-items-center overflow-hidden rounded-2xl bg-night text-lg font-black text-white shadow-[var(--shadow-glow)]">
              <span className="uae-flag-strip absolute inset-0" />
              <span className="absolute inset-y-0 right-0 w-1/4 bg-uae-red" />
              <span className="relative rounded-xl bg-uae-black/80 px-2 py-1 text-xs tracking-wide">
                UAE
              </span>
            </span>
            <span>
              <span className="block text-lg font-black text-ink">
                UAE Sales
              </span>
              <span className="block text-xs font-black text-secondary">
                سوق إماراتي بضمان آمن
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-black text-primary lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-secondary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action="/search"
            className="order-3 grid w-full grid-cols-[1fr_auto] rounded-full border border-border bg-white p-1 shadow-sm lg:order-none lg:max-w-xs"
          >
            <input
              aria-label="بحث سريع"
              className="min-h-10 rounded-full bg-transparent px-4 text-sm font-bold text-ink outline-none placeholder:text-muted"
              name="q"
              placeholder="ابحث عن سيارة، عقار..."
              type="search"
            />
            <button
              className="rounded-full bg-secondary px-4 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              type="submit"
            >
              بحث
            </button>
          </form>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden rounded-full border border-border px-4 py-2.5 text-sm font-black text-primary transition hover:border-secondary md:inline-flex"
                >
                  حسابي
                </Link>
                <button
                  className="rounded-full border border-border px-4 py-2.5 text-sm font-black text-primary transition hover:border-secondary"
                  onClick={clearSessionUser}
                  type="button"
                >
                  خروج
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-border px-4 py-2.5 text-sm font-black text-primary transition hover:border-secondary"
              >
                دخول
              </Link>
            )}
            <Link
              href="/listings/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              أضف إعلان
            </Link>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-border py-2 text-sm font-black text-muted lg:hidden">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-border bg-white px-4 py-2 transition hover:border-secondary hover:bg-secondary-soft hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="shrink-0 rounded-full border border-border bg-white px-4 py-2 transition hover:border-secondary hover:bg-secondary-soft hover:text-primary"
          >
            البحث
          </Link>
        </nav>
      </div>
    </header>
  );
}
