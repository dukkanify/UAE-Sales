"use client";

import { useState } from "react";

type FavoriteButtonProps = {
  ariaLabel?: string;
  className?: string;
  label?: string;
};

export function FavoriteButton({
  ariaLabel = "إضافة إلى المفضلة",
  className = "",
  label = "إضافة للمفضلة",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const text = label ? (isFavorite ? "♥ تمت الإضافة" : `♡ ${label}`) : isFavorite ? "♥" : "♡";

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={isFavorite}
      className={className}
      onClick={() => setIsFavorite((current) => !current)}
      title={ariaLabel}
      type="button"
    >
      {text}
    </button>
  );
}
