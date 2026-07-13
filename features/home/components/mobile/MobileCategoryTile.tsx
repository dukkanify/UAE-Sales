import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
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
      <span
        className={`mobile-home-categories__thumb ${
          variant === "more" ? "mobile-home-categories__thumb--more" : ""
        }`}
      >
        {variant === "more" ? (
          <Icon aria-hidden name="grid" size={22} />
        ) : category ? (
          <AppImage
            alt=""
            aria-hidden
            className="object-cover"
            fallbackCategory={category.id}
            fill
            sizes="72px"
            src={category.imageUrl}
          />
        ) : null}
      </span>
      <span className="mobile-home-categories__label">{label}</span>
    </Link>
  );
}
