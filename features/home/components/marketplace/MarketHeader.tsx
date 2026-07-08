"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
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

export function MarketHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    sync();
    window.addEventListener(STORAGE_EVENTS.sessionChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.sessionChange, sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur-md">
      <div className="h-0.5 uae-header-accent" />
      <div className="app-container">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-4 md:min-h-[4.5rem]">
          <BrandLogo showTagline={false} size="md" />

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
              className="sooqna-gold-gradient hidden min-h-10 items-center gap-1.5 rounded-full px-5 text-sm font-bold text-white shadow-[0_6px_20px_rgb(201_169_98/30%)] sm:inline-flex"
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
