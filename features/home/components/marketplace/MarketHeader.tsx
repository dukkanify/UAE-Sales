"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import type { UserProfile } from "@/types";

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/categories", label: "التصنيفات" },
  { href: "/featured", label: "الإعلانات المميزة" },
  { href: "/escrow", label: "الضمان المالي" },
  { href: "/search", label: "الشركات" },
];

function BrandMark() {
  return (
    <span className="relative grid size-11 place-items-center">
      <span className="uae-hex-mark absolute inset-0 uae-gold-gradient shadow-[0_4px_16px_rgb(184_149_95/30%)]" />
      <span className="relative text-[0.65rem] font-black tracking-wider text-white">UAE</span>
      <span className="absolute -start-px top-[20%] bottom-[20%] w-[3px] rounded-full bg-uae-red/90" />
    </span>
  );
}

export function MarketHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    sync();
    window.addEventListener("uae-sales-session-change", sync);
    return () => window.removeEventListener("uae-sales-session-change", sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur-md">
      <div className="h-0.5 uae-header-accent" />
      <div className="app-container">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-4 md:min-h-[4.5rem]">
          <Link className="flex items-center gap-3" href="/">
            <BrandMark />
            <span className="hidden sm:block">
              <span className="block text-base font-bold text-ink">UAE Sales</span>
              <span className="block text-[0.65rem] font-semibold text-[#B8955F]">
                سوق الإمارات الموثوق
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item, i) => (
              <Link
                key={item.href}
                className={`rounded-lg px-3.5 py-2 text-sm transition hover:bg-[#B8955F]/8 ${
                  i === 0 ? "font-bold text-ink" : "font-semibold text-muted hover:text-ink"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-[#fdfbf7] px-3 py-1.5 md:inline-flex">
              <span className="inline-block h-3.5 w-5 overflow-hidden rounded-sm uae-flag-strip" />
              <span className="text-xs font-bold text-ink">العربية</span>
            </span>

            <Link
              aria-label="بحث"
              className="grid size-10 place-items-center rounded-lg text-muted hover:bg-[#B8955F]/10 hover:text-[#B8955F]"
              href="/search"
            >
              <Icon name="search" size={20} />
            </Link>

            {user ? (
              <Link className="hidden px-3 py-2 text-sm font-semibold text-muted sm:inline-flex" href="/profile">
                {user.fullName.split(" ")[0]}
              </Link>
            ) : (
              <Link className="hidden px-3 py-2 text-sm font-semibold text-muted sm:inline-flex" href="/login">
                دخول
              </Link>
            )}

            <Link
              className="uae-gold-gradient hidden min-h-10 items-center gap-1.5 rounded-full px-5 text-sm font-bold text-white shadow-[0_6px_20px_rgb(184_149_95/30%)] sm:inline-flex"
              href="/listings/new"
            >
              <Icon name="plus" size={16} />
              أضف إعلانك
            </Link>

            <button
              aria-expanded={menuOpen}
              aria-label="القائمة"
              className="grid size-10 place-items-center rounded-lg border border-border lg:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-border py-4 lg:hidden">
            <div className="grid gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-ink"
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button className="mt-2 w-full" href="/listings/new" variant="accent">
                أضف إعلانك
              </Button>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
