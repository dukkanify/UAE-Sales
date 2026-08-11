"use client";

import Link from "@/components/ui/app-link";

import { siteStatic } from "@/config/site-static";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";
import { safeHref } from "@/lib/links/safe-href";

interface BrandLogoProps {
  className?: string;
  /** `null` disables linking; omit/`undefined` defaults to home. */
  href?: string | null;
  variant?: "full" | "mark" | "dark" | "stacked";
  priority?: boolean;
  showWordmark?: boolean;
}

/**
 * Static brand mark — no BrandProvider/useBrand on the critical layout path.
 * Runtime brand API still powers other surfaces via BrandProvider.
 * Lockups follow official guidelines: horizontal (full/dark) and stacked.
 */
function BrandLogo({
  className,
  href,
  variant = "full",
  priority = false,
  showWordmark = false,
}: BrandLogoProps) {
  const name = siteStatic.name;
  const src =
    variant === "mark"
      ? siteStatic.brand.icon
      : variant === "dark"
        ? siteStatic.brand.logoDark
        : variant === "stacked"
          ? siteStatic.brand.logoStacked
          : siteStatic.brand.logo;

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
        width={variant === "mark" ? 40 : variant === "stacked" ? 140 : 240}
        height={variant === "mark" ? 40 : variant === "stacked" ? 130 : 52}
        className={cn(
          "h-10 w-auto object-contain",
          variant === "mark" && "h-10 w-10",
          variant === "full" && "h-9 w-auto max-w-[240px] sm:h-10",
          variant === "dark" && "h-9 w-auto max-w-[240px] sm:h-10",
          variant === "stacked" && "h-24 w-auto max-w-[160px]",
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

  if (!resolvedHref) return content;
  return (
    <Link href={resolvedHref} className="inline-flex items-center" aria-label={name}>
      {content}
    </Link>
  );
}

export { BrandLogo };
