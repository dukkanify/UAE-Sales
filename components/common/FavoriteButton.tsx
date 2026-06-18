"use client";

import { useState } from "react";

type FavoriteButtonProps = {
  className?: string;
  label?: string;
};

export function FavoriteButton({
  className = "",
  label = "إضافة للمفضلة",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const text = label ? (isFavorite ? "♥ تمت الإضافة" : `♡ ${label}`) : isFavorite ? "♥" : "♡";

  return (
    <button
      aria-pressed={isFavorite}
      className={className}
      onClick={() => setIsFavorite((current) => !current)}
      type="button"
    >
      {text}
    </button>
  );
}
