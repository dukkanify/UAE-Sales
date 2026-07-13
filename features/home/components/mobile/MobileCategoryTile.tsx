import Link from "next/link";
import type { Category } from "@/types";
import { CategoryThumbnail } from "@/shared/components/CategoryThumbnail";
import { Icon } from "@/shared/ui/Icon";

type MobileCategoryTileProps = {
  category?: Category;
  href: string;
  label: string;
  variant?: "category" | "more";
};

export function MobileCategoryTile({
  category,
  href,
  label,
  variant = "category",
}: MobileCategoryTileProps) {
  return (
    <Link className="mobile-home-categories__card" href={href}>
      {variant === "more" ? (
        <span className="mobile-home-categories__thumb mobile-home-categories__thumb--more">
          <Icon aria-hidden name="grid" size={22} />
        </span>
      ) : category ? (
        <CategoryThumbnail category={category} className="mx-0" />
      ) : null}
      <span className="mobile-home-categories__label">{label}</span>
    </Link>
  );
}
