"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { NAV_ITEMS } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";

function navHrefKey(href: (typeof NAV_ITEMS)[number]["href"]): string {
  if (typeof href === "string") return href;
  const path = href.pathname ?? "/";
  const hash = href.hash ? `#${href.hash.replace(/^#/, "")}` : "";
  return `${path}${hash}`;
}

function navPathname(href: (typeof NAV_ITEMS)[number]["href"]): string {
  if (typeof href === "string") return href.split("#")[0] || "/";
  return href.pathname || "/";
}

function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const isHome = pathname === "/";

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 text-white transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
        isHome && !scrolled && !open
          ? "border-b border-transparent bg-transparent"
          : "border-b border-white/10 bg-[var(--surface-ink)]/75 shadow-[0_1px_0_0_rgba(221,155,48,0.1)] backdrop-blur-2xl",
      )}
    >
      <div className="container-app flex h-[4.75rem] items-center justify-between gap-4">
        <BrandLogo variant="dark" href={routes.home} priority />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const itemPath = navPathname(item.href);
            const active =
              itemPath === "/"
                ? pathname === "/" && typeof item.href === "string"
                : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
            return (
              <Link
                key={navHrefKey(item.href)}
                href={item.href}
                className={cn(
                  "rounded-md px-3.5 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            className="text-white/75 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href={routes.login}>Enter</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href={routes.book}>Book live</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="animate-in-fade border-t border-white/10 bg-[var(--surface-ink)]/95 backdrop-blur-2xl md:hidden"
        >
          <nav className="container-app flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={navHrefKey(item.href)}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href={routes.login}>Enter platform</Link>
              </Button>
              <Button variant="accent" asChild>
                <Link href={routes.book}>Book live</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export { Header };
