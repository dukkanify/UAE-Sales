import type { Category } from "@/types";
import {
  CategoryThumbnail,
  sizeFromPixels,
} from "@/shared/components/CategoryThumbnail";

type CategoryIconProps = {
  category: Pick<Category, "id" | "imageUrl" | "name">;
  className?: string;
  size?: number;
};

/** @deprecated Prefer `CategoryThumbnail` — kept for existing imports. */
export function CategoryIcon({
  category,
  className = "",
  size = 20,
}: CategoryIconProps) {
  return (
    <CategoryThumbnail
      category={category}
      className={className}
      size={sizeFromPixels(size)}
    />
  );
}
