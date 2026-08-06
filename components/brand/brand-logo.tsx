"use client";

import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { useBrand } from "@/providers/brand-provider";

interface BrandLogoProps {
  className?: string;
  href?: string | null;
  variant?: "full" | "mark" | "dark";
  priority?: boolean;
  showWordmark?: boolean;
}

const FALLBACK_ASSETS = {
  logo: "/brand/logo.svg",
  logoDark: "/brand/logo-dark.svg",
  icon: "/brand/icon.svg",
} as const;

/**
 * Brand mark — uses native <img> (local SVGs) to avoid next/image webpack
 * module-factory crashes ("Cannot read properties of undefined (reading 'call')")
 * that show up in Footer/Header after HMR / RSC boundary splits.
 */
function BrandLogo({
  className,
  href = routes.home,
  variant = "full",
  priority = false,
  showWordmark = false,
}: BrandLogoProps) {
  const brand = useBrand();
  const assets = siteConfig?.brand ?? FALLBACK_ASSETS;
  const name = brand?.platformName || siteConfig?.name || "ATPL PASS";
  const src =
    variant === "mark"
      ? brand?.faviconUrl || assets.icon || FALLBACK_ASSETS.icon
      : variant === "dark"
        ? brand?.darkLogoUrl || assets.logoDark || FALLBACK_ASSETS.logoDark
        : brand?.logoUrl || assets.logo || FALLBACK_ASSETS.logo;

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image webpack factory can be undefined under HMR */}
      <img
        src={src}
        alt={name}
        width={variant === "mark" ? 36 : 160}
        height={variant === "mark" ? 36 : 40}
        className={cn(
          "h-9 w-auto object-contain",
          variant === "mark" && "h-9 w-9",
          variant === "full" && "h-8 w-auto max-w-[160px]",
          variant === "dark" && "h-8 w-auto max-w-[160px]",
        )}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      {showWordmark && variant === "mark" ? (
        <span className="font-display text-lg font-semibold tracking-tight text-primary">
          {name}
        </span>
      ) : null}
    </span>
  );

  if (href === null || href === "") return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={name}>
      {content}
    </Link>
  );
}

export { BrandLogo };
