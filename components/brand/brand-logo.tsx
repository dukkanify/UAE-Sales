"use client";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";

interface BrandLogoProps {
  className?: string;
  href?: string | null;
  variant?: "full" | "mark" | "dark";
  priority?: boolean;
  showWordmark?: boolean;
}

function BrandLogo({
  className,
  href = routes.home,
  variant = "full",
  priority,
  showWordmark = false,
}: BrandLogoProps) {
  const src =
    variant === "mark"
      ? siteConfig.brand.icon
      : variant === "dark"
        ? siteConfig.brand.logoDark
        : siteConfig.brand.logo;

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={src}
        alt={siteConfig.name}
        width={variant === "mark" ? 36 : 160}
        height={variant === "mark" ? 36 : 40}
        className={cn(
          "h-9 w-auto object-contain",
          variant === "mark" && "h-9 w-9",
          variant === "full" && "h-8 w-auto max-w-[160px]",
          variant === "dark" && "h-8 w-auto max-w-[160px]",
        )}
        priority={priority}
        unoptimized
      />
      {showWordmark && variant === "mark" ? (
        <span className="font-display text-lg font-semibold tracking-tight text-primary">
          {siteConfig.name}
        </span>
      ) : null}
    </span>
  );

  if (href === null || href === "") return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={siteConfig.name}>
      {content}
    </Link>
  );
}

export { BrandLogo };
