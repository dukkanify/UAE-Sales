"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { NAV_ITEMS } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";

function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[var(--surface-ink)]/80 text-white backdrop-blur-2xl">
      <div className="container-app flex h-[4.5rem] items-center justify-between gap-4">
        <BrandLogo variant="dark" priority />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
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
            className="text-white/80 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href={routes.login}>Sign in</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href={routes.book}>Book now</Link>
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
        <div id="mobile-nav" className="animate-in-fade border-t border-white/10 md:hidden">
          <nav className="container-app flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
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
                <Link href={routes.login}>Sign in</Link>
              </Button>
              <Button variant="accent" asChild>
                <Link href={routes.book}>Book now</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export { Header };
