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
  variant?: "full" | "mark" | "dark" | "stacked";
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

  const src =
    variant === "mark"
      ? siteStatic.brand.iconLight
      : variant === "dark"
        ? brand.darkLogoUrl || siteStatic.brand.logoDark
        : variant === "stacked"
          ? siteStatic.brand.logoStacked
          : brand.logoUrl || siteStatic.brand.logo;

  // Explicit null/"" = mark only. Omitted/`undefined` defaults to home silently
  // (JS default params do NOT apply when the caller passes `href={undefined}`).
  // Only invalid non-empty values go through safeHref (which warns in dev).
  const disableLink = href === null || href === "";
  const resolvedHref = disableLink
    ? null
    : href === undefined
      ? routes.home
      : safeHref(href, routes.home);

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
          variant === "full" && "h-10 w-auto max-w-[360px] sm:h-11",
          variant === "dark" && "h-10 w-auto max-w-[360px] sm:h-11",
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
