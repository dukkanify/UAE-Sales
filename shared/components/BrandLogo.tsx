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

export function BrandLogo({
  className = "",
  href = "/",
  showTagline = true,
  size = "md",
  theme = "light",
  variant = "horizontal",
}: BrandLogoProps) {
  const markSize = markSizes[size];
  const isDark = theme === "dark";
  const ink = isDark ? "text-white" : "text-ink";
  const gold = isDark ? "text-secondary" : "text-secondary";
  const muted = isDark ? "text-white/70" : "text-muted";

  const iconOnly = (
    <BrandMark size={markSize} variant={isDark ? "dark" : "default"} />
  );

  const wordmark = (
    <span className="min-w-0">
      <span
        className={`block font-latin text-sm font-bold tracking-tight ${ink} sm:text-base`}
      >
        {BRAND.nameEn}
      </span>
      {variant !== "icon" ? (
        <span className={`block text-[0.65rem] font-bold ${gold}`}>
          {BRAND.nameAr}
        </span>
      ) : null}
      {showTagline && variant === "bilingual" ? (
        <span className={`mt-0.5 block text-[0.6rem] font-medium ${muted}`}>
          {BRAND.taglineAr}
        </span>
      ) : null}
    </span>
  );

  const content =
    variant === "icon" ? (
      iconOnly
    ) : variant === "vertical" ? (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
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
    <Link aria-label={`${BRAND.nameAr} ${BRAND.nameEn}`} className="shrink-0" href={href}>
      {content}
    </Link>
  );
}
