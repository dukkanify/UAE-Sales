"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { NAV_ITEMS } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";

function navHrefKey(href: (typeof NAV_ITEMS)[number]["href"]): string {
  return href;
}

function navPathname(href: (typeof NAV_ITEMS)[number]["href"]): string {
  return href.split("#")[0] || "/";
}

function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const isHome = pathname === "/";
  const isBook = pathname === routes.book || pathname.startsWith(`${routes.book}/`);
  const solid = !(isHome && !scrolled && !open);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 text-white transition-[background-color,border-color,backdrop-filter,box-shadow,padding] duration-300",
        solid
          ? "border-b border-white/10 bg-[var(--surface-ink)]/80 shadow-[0_1px_0_0_rgba(204,160,76,0.14)] backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-app relative flex h-[4.5rem] items-center justify-between gap-3 sm:h-[4.85rem]">
        <div className="relative z-10 min-w-0 shrink-0">
          <BrandLogo
            variant="dark"
            href={routes.home}
            priority
            className="[&_img]:h-11 [&_img]:max-w-[360px] sm:[&_img]:h-12"
          />
        </div>

        <nav
          className="site-header-nav absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 md:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const itemPath = navPathname(item.href);
            const active =
              itemPath === "/"
                ? pathname === "/"
                : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
            return (
              <Link
                key={navHrefKey(item.href)}
                href={item.href}
                className={cn(
                  "site-header-link relative px-3.5 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200",
                  active ? "text-white" : "text-white/48 hover:text-white",
                )}
                data-active={active || undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 hidden items-center gap-1.5 md:flex">
          <Button
            variant="ghost"
            className="h-10 rounded-xl px-3.5 text-white/70 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href={routes.login}>Enter</Link>
          </Button>
          <Button
            variant="accent"
            className="hero-cta-primary h-10 rounded-xl px-4 shadow-[0_12px_28px_-16px_rgba(204,160,76,0.85)]"
            asChild
          >
            <Link href={isBook ? routes.register : routes.book}>
              {isBook ? "Join" : "Book live"}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative z-10 rounded-xl text-white hover:bg-white/10 md:hidden"
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
          className="animate-in-fade border-t border-white/10 bg-[var(--surface-ink)]/96 backdrop-blur-2xl md:hidden"
        >
          <nav className="container-app flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const itemPath = navPathname(item.href);
              const active =
                itemPath === "/"
                  ? pathname === "/"
                  : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
              return (
                <Link
                  key={navHrefKey(item.href)}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-medium transition",
                    active
                      ? "bg-white/10 text-white shadow-[inset_3px_0_0_0_var(--accent)]"
                      : "text-white/75 hover:bg-white/8 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href={routes.login}>Enter platform</Link>
              </Button>
              <Button variant="accent" className="hero-cta-primary" asChild>
                <Link href={isBook ? routes.register : routes.book}>
                  {isBook ? "Join AviatorPass" : "Book live"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export { Header };
