import type { Category } from "@/types";
import { Icon } from "@/components/ui/Icon";

type CategoryIconProps = {
  category: Pick<Category, "icon">;
  className?: string;
  size?: number;
};

export function CategoryIcon({
  category,
  className = "",
  size = 20,
}: CategoryIconProps) {
  return (
    <Icon className={className} name={category.icon} size={size} />
  );
}
