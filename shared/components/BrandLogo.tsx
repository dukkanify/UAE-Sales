import Link from "next/link";
import { BRAND } from "@/shared/constants/brand";
import { BrandMark } from "@/shared/components/BrandMark";

type BrandLogoProps = {
  className?: string;
  href?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
  variant?: "horizontal" | "vertical" | "icon" | "bilingual";
};

const markSizes = { sm: 32, md: 40, lg: 48 } as const;

const titleSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
} as const;

const enSizes = {
  sm: "text-[0.65rem]",
  md: "text-[0.7rem]",
  lg: "text-xs",
} as const;

/**
 * Canonical Sooqna wordmark: mark + Arabic primary + English secondary.
 * Use this everywhere instead of custom header/footer brand markup.
 */
export function BrandLogo({
  className = "",
  href = "/",
  showTagline = false,
  size = "md",
  theme = "light",
  variant = "horizontal",
}: BrandLogoProps) {
  const markSize = markSizes[size];
  const isDark = theme === "dark";
  const ink = isDark ? "text-white" : "text-ink";
  const gold = "text-secondary";
  const muted = isDark ? "text-white/65" : "text-muted";

  const iconOnly = (
    <BrandMark size={markSize} variant={isDark ? "dark" : "default"} />
  );

  const wordmark = (
    <span className="min-w-0 text-start leading-none">
      <span className={`block font-black tracking-tight ${titleSizes[size]} ${ink}`}>
        {BRAND.nameAr}
      </span>
      <span
        className={`mt-1 block font-latin font-bold tracking-[0.04em] ${enSizes[size]} ${gold}`}
      >
        {BRAND.nameEn}
      </span>
      {showTagline || variant === "bilingual" ? (
        <span className={`mt-1.5 block text-[0.6rem] font-medium leading-snug ${muted}`}>
          {BRAND.taglineAr}
        </span>
      ) : null}
    </span>
  );

  const content =
    variant === "icon" ? (
      iconOnly
    ) : variant === "vertical" ? (
      <span className={`inline-flex flex-col items-center gap-2.5 text-center ${className}`}>
        {iconOnly}
        {wordmark}
      </span>
    ) : (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        {iconOnly}
        {wordmark}
      </span>
    );

  if (!href) {
    return content;
  }

  return (
    <Link
      aria-label={`${BRAND.nameAr} — ${BRAND.nameEn}`}
      className="inline-flex shrink-0 items-center"
      href={href}
    >
      {content}
    </Link>
  );
}
