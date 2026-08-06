"use client";

import Link from "next/link";

import { siteStatic } from "@/config/site-static";
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

/**
 * Brand mark — native <img> for local SVGs (avoids next/image webpack factory
 * crashes). Uses site-static only — never pulls Zod via @/config/site.
 */
function BrandLogo({
  className,
  href = routes.home,
  variant = "full",
  priority = false,
  showWordmark = false,
}: BrandLogoProps) {
  const brand = useBrand();
  const name = brand.platformName || siteStatic.name;
  const src =
    variant === "mark"
      ? brand.faviconUrl || siteStatic.brand.icon
      : variant === "dark"
        ? brand.darkLogoUrl || siteStatic.brand.logoDark
        : brand.logoUrl || siteStatic.brand.logo;

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
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
