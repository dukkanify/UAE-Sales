"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

type FavoriteButtonProps = {
  ariaLabel?: string;
  className?: string;
  iconOnly?: boolean;
  label?: string;
};

export function FavoriteButton({
  ariaLabel = "إضافة إلى المفضلة",
  className = "",
  iconOnly = false,
  label = "مفضلة",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Button
      aria-label={ariaLabel}
      aria-pressed={isFavorite}
      className={`${className} ${isFavorite ? "border-accent/30 bg-accent-soft text-accent" : ""}`.trim()}
      iconOnly={iconOnly && !label}
      onClick={() => setIsFavorite((current) => !current)}
      size="md"
      title={ariaLabel}
      type="button"
      variant="outline"
    >
      <Icon className="shrink-0" name="heart" size={16} />
      {label ? (isFavorite ? "تمت الإضافة" : label) : null}
    </Button>
  );
}
