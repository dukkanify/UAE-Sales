import { AppImage } from "@/shared/components/AppImage";
import type { Category } from "@/types";

type CategoryThumbnailSize = "sm" | "md" | "lg" | "xl";

type CategoryThumbnailProps = {
  category: Pick<Category, "id" | "imageUrl" | "name">;
  className?: string;
  size?: CategoryThumbnailSize;
};

const SIZE_STYLES: Record<
  CategoryThumbnailSize,
  { box: string; imageSizes: string }
> = {
  sm: {
    box: "size-10 rounded-[var(--radius-lg)]",
    imageSizes: "40px",
  },
  md: {
    box: "size-[3.25rem] rounded-[1.125rem]",
    imageSizes: "52px",
  },
  lg: {
    box: "size-16 rounded-[1.25rem]",
    imageSizes: "64px",
  },
  xl: {
    box: "size-20 rounded-[1.375rem]",
    imageSizes: "80px",
  },
};

function sizeFromPixels(pixels: number): CategoryThumbnailSize {
  if (pixels <= 24) {
    return "sm";
  }
  if (pixels <= 36) {
    return "md";
  }
  if (pixels <= 48) {
    return "lg";
  }
  return "xl";
}

export function CategoryThumbnail({
  category,
  className = "",
  size = "md",
}: CategoryThumbnailProps) {
  const styles = SIZE_STYLES[size];

  return (
    <span
      aria-hidden
      className={`category-thumbnail relative inline-flex shrink-0 overflow-hidden border-2 border-white/90 bg-slate-100 shadow-[0_1px_2px_rgb(15_23_42/5%),0_8px_20px_rgb(15_23_42/9%)] transition-transform duration-200 ${styles.box} ${className}`}
    >
      <AppImage
        alt=""
        aria-hidden
        className="object-cover"
        fallbackCategory={category.id}
        fill
        sizes={styles.imageSizes}
        src={category.imageUrl}
      />
    </span>
  );
}

export { sizeFromPixels };
export type { CategoryThumbnailSize };
