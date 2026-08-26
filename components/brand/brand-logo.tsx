"use client";

import Link from "@/components/ui/app-link";

import { siteStatic } from "@/config/site-static";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { safeHref } from "@/lib/links/safe-href";
import { useBrand } from "@/providers/brand-provider";

interface BrandLogoProps {
  className?: string;
  /** `null` disables linking; omit/`undefined` defaults to home. */
  href?: string | null;
  variant?: "full" | "mark" | "dark" | "stacked" | "text";
  priority?: boolean;
  showWordmark?: boolean;
}

/**
 * Official AviatorPass lockup (wing + open book).
 * Prefers runtime branding settings when available; falls back to siteStatic assets.
 */
function BrandLogo({
  className,
  href,
  variant = "full",
  priority = false,
  showWordmark = false,
}: BrandLogoProps) {
  const brand = useBrand();
  const name = brand.platformName || siteStatic.name;

  const disableLink = href === null || href === "";
  const resolvedHref = disableLink
    ? null
    : href === undefined
      ? routes.home
      : safeHref(href, routes.home);

  if (variant === "text") {
    const textLogo = (
      <span
        className={cn(
          "font-display text-[1.15rem] font-bold tracking-[0.06em] sm:text-[1.25rem]",
          className,
        )}
      >
        <span className="text-white">ATPL</span>{" "}
        <span className="bg-gradient-to-r from-[#f6c36c] via-[#cca04c] to-[#9e712e] bg-clip-text text-transparent">
          PASS
        </span>
      </span>
    );
    if (!resolvedHref) return textLogo;
    return (
      <Link href={resolvedHref} className="inline-flex items-center" aria-label={name}>
        {textLogo}
      </Link>
    );
  }

  // Prefer official brand-guide PNG lockups (wing + book). SVG masters are
  // approximations kept only for favicon / edit — never override the PNGs.
  const src =
    variant === "mark"
      ? siteStatic.brand.icon || siteStatic.brand.iconLight
      : variant === "dark"
        ? siteStatic.brand.logoDark
        : variant === "stacked"
          ? siteStatic.brand.logoStacked
          : siteStatic.brand.logo || brand.logoUrl;

  // Explicit null/"" = mark only. Omitted/`undefined` defaults to home silently
  // (JS default params do NOT apply when the caller passes `href={undefined}`).
  // Only invalid non-empty values go through safeHref (which warns in dev).

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand PNG/SVG lockup */}
      <img
        src={src}
        alt={name}
        width={variant === "mark" ? 44 : variant === "stacked" ? 160 : 360}
        height={variant === "mark" ? 44 : variant === "stacked" ? 150 : 76}
        className={cn(
          "h-11 w-auto object-contain object-left",
          variant === "mark" && "h-11 w-11",
          variant === "full" && "h-10 w-auto max-w-[min(360px,85vw)] sm:h-11",
          variant === "dark" && "h-10 w-auto max-w-[min(360px,85vw)] sm:h-11",
          variant === "stacked" && "h-28 w-auto max-w-[180px]",
        )}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      {showWordmark && variant === "mark" ? (
        <span className="font-display text-lg font-semibold tracking-tight text-primary">
          <span className="text-primary">AVIATOR</span> <span className="text-accent">PASS</span>
        </span>
      ) : null}
    </span>
  );

  if (!resolvedHref) return content;
  return (
    <Link href={resolvedHref} className="inline-flex items-center" aria-label={name}>
      {content}
    </Link>
  );
}

export { BrandLogo };
