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

function BrandMark() {
  return (
    <span className="relative grid size-12 place-items-center md:size-[3.25rem]">
      <span className="uae-hex-mark absolute inset-0 uae-gold-gradient shadow-[0_6px_20px_rgb(184_149_95/35%)]" />
      <span className="uae-hex-mark absolute inset-[3px] bg-white/20" />
      <span className="relative text-[0.7rem] font-black tracking-[0.08em] text-white md:text-xs">
        UAE
      </span>
      <span className="absolute -start-px top-[22%] bottom-[22%] w-[3px] rounded-full bg-uae-red/90" />
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
    <header className="sticky top-0 z-50 uae-header-sand shadow-[0_1px_0_rgb(15_20_25/5%)] backdrop-blur-md">
      <div className="h-0.5 uae-header-accent" />
      <div className="app-container">
        <div className="flex min-h-[4.75rem] items-center justify-between gap-4 md:min-h-[5rem]">
          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <Link className="flex items-center gap-3" href="/">
              <BrandMark />
              <span className="hidden sm:block">
                <span className="block text-base font-bold tracking-tight text-ink">
                  UAE Sales
                </span>
                <span className="block text-[0.65rem] font-semibold text-[#B8955F]">
                  سوق إماراتي فاخر
                </span>
              </span>
            </Link>

            <span className="hidden items-center gap-2 rounded-full border border-[#B8955F]/20 bg-white px-3 py-1.5 shadow-sm md:inline-flex">
              <span className="inline-block h-4 w-6 shrink-0 overflow-hidden rounded-sm uae-flag-strip" />
              <span className="text-xs font-bold text-ink">العربية</span>
            </span>
          </div>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {homeNavigation.map((item, index) => (
              <Link
                key={item.href}
                className={`relative rounded-lg px-3.5 py-2.5 text-sm transition hover:bg-[#B8955F]/8 hover:text-ink ${
                  index === 0
                    ? "font-bold text-ink after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#B8955F]/70"
                    : "font-semibold text-muted"
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
              className="grid size-10 place-items-center rounded-lg text-muted transition hover:bg-[#B8955F]/10 hover:text-[#B8955F] md:size-11"
              href="/search"
            >
              <Icon name="search" size={20} />
            </Link>

            {user ? (
              <Link
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
                href="/profile"
              >
                {user.fullName.split(" ")[0]}
              </Link>
            ) : (
              <Link
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
                href="/login"
              >
                دخول
              </Link>
            )}

            <Link
              className="uae-gold-gradient hidden min-h-11 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgb(184_149_95/32%)] transition hover:brightness-105 sm:inline-flex"
              href="/listings/new"
            >
              <Icon name="plus" size={17} />
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
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#B8955F]/8"
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
                variant="accent"
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
