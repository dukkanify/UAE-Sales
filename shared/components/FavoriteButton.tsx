"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

type FavoriteButtonProps = {
  ariaLabel?: string;
  className?: string;
  label?: string;
};

const baseClass =
  "focus-ring interactive-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 text-sm font-semibold text-ink transition";

export function FavoriteButton({
  ariaLabel = "إضافة إلى المفضلة",
  className = "",
  label = "مفضلة",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={isFavorite}
      className={`${baseClass} ${isFavorite ? "border-accent/30 bg-accent-soft text-accent" : ""} ${className}`}
      onClick={() => setIsFavorite((current) => !current)}
      title={ariaLabel}
      type="button"
    >
      <Icon name="heart" size={16} />
      {label ? (isFavorite ? "تمت الإضافة" : label) : null}
    </button>
  );
}
