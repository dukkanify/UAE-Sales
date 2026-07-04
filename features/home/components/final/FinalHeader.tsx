"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";
import type { UserProfile } from "@/types";

const homeNavigation = [
  { href: "/", label: "الرئيسية" },
  { href: "/categories", label: "التصنيفات" },
  { href: "/listings/new", label: "أضف إعلانك" },
  { href: "/featured", label: "الإعلانات المميزة" },
  { href: "/escrow", label: "الضمان المالي" },
  { href: "/search", label: "الشركات" },
];

function HexLogo() {
  return (
    <span
      className="grid size-11 place-items-center bg-[#B8955F] text-[0.65rem] font-bold text-white md:size-12"
      style={{
        clipPath:
          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      }}
    >
      UAE
    </span>
  );
}

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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-sm">
      <div className="app-container">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4 md:min-h-[4.75rem]">
          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <Link className="flex items-center gap-3" href="/">
              <HexLogo />
              <span className="hidden text-base font-bold tracking-tight text-ink sm:block">
                UAE Sales
              </span>
            </Link>

            <span className="hidden items-center gap-2 rounded-full border border-border bg-surface-muted/50 px-3 py-1.5 md:inline-flex">
              <span className="inline-block h-4 w-6 shrink-0 overflow-hidden rounded-sm uae-flag-strip" />
              <span className="text-xs font-semibold text-ink">العربية</span>
            </span>
          </div>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {homeNavigation.map((item, index) => (
              <Link
                key={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-surface-muted ${
                  index === 0
                    ? "font-bold text-ink"
                    : "font-medium text-muted hover:text-ink"
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
              className="grid size-10 place-items-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-ink"
              href="/search"
            >
              <Icon name="search" size={20} />
            </Link>

            {user ? (
              <Link
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
                href="/profile"
              >
                {user.fullName.split(" ")[0]}
              </Link>
            ) : (
              <Link
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
                href="/login"
              >
                دخول
              </Link>
            )}

            <Link
              className="hidden min-h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[0_4px_16px_rgb(15_20_25/15%)] transition hover:bg-primary-dark sm:inline-flex"
              href="/listings/new"
            >
              <Icon name="plus" size={16} />
              أضف إعلانك
            </Link>

            <button
              aria-expanded={menuOpen}
              aria-label="القائمة"
              className="grid size-10 place-items-center rounded-lg border border-border text-ink xl:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-border py-4 xl:hidden">
            <div className="grid gap-1">
              {homeNavigation.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-ink transition hover:bg-surface-muted"
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                className="mt-2 w-full"
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
                    className="rounded-lg px-4 py-3 text-sm font-medium text-ink"
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    حسابي
                  </Link>
                  <button
                    className="w-full rounded-lg px-4 py-3 text-right text-sm font-medium text-muted"
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
                  className="rounded-lg px-4 py-3 text-sm font-medium text-ink"
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
