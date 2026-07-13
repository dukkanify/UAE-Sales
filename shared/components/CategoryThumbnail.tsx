import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";

type CategoryThumbnailProps = {
  category: Category;
  className?: string;
  selected?: boolean;
  size?: "md" | "sm";
};

const sizeClasses = {
  md: "size-16 sm:size-[4.25rem]",
  sm: "size-14",
} as const;

export function CategoryThumbnail({
  category,
  className = "",
  selected = false,
  size = "md",
}: CategoryThumbnailProps) {
  return (
    <span
      className={`relative mx-auto overflow-hidden rounded-2xl border-2 bg-surface-muted shadow-[0_8px_20px_rgb(15_23_42/9%)] transition ${sizeClasses[size]} ${
        selected
          ? "border-secondary ring-2 ring-secondary/25"
          : "border-white"
      } ${className}`}
    >
      <AppImage
        alt=""
        aria-hidden
        className="object-cover"
        fallbackCategory={category.id}
        fill
        sizes={size === "md" ? "(max-width: 640px) 64px, 68px" : "56px"}
        src={category.imageUrl}
      />
    </span>
  );
}
