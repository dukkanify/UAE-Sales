import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";

type CategoryThumbnailProps = {
  category: Category;
  className?: string;
  selected?: boolean;
  variant?: "compact" | "default";
};

/** Same category photo tile used on the mobile homepage grid. */
export function CategoryThumbnail({
  category,
  className = "",
  selected = false,
  variant = "default",
}: CategoryThumbnailProps) {
  return (
    <span
      className={`mobile-home-categories__thumb mx-auto ${
        variant === "compact" ? "add-listing-category-thumb" : ""
      } ${selected ? "mobile-home-categories__thumb--selected" : ""} ${className}`.trim()}
    >
      <AppImage
        alt={category.name}
        className="object-cover"
        fallbackCategory={category.id}
        fill
        sizes="72px"
        src={category.imageUrl}
      />
    </span>
  );
}
