"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <BrandLogo priority />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href={routes.login}>Sign in</Link>
          </Button>
          <Button asChild>
            <Link href={routes.register}>Get started</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <nav className="container-app flex flex-col gap-1 py-4" aria-label="Mobile">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <Button variant="outline" asChild>
                  <Link href={routes.login}>Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href={routes.register}>Get started</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export { Header };
