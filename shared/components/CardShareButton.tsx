"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

type CardShareButtonProps = {
  ariaLabel?: string;
  className?: string;
  title: string;
  url: string;
};

export function CardShareButton({
  ariaLabel = "مشاركة الإعلان",
  className = "",
  title,
  url,
}: CardShareButtonProps) {
  const [shared, setShared] = useState(false);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setShared(true);
        return;
      }

      await navigator.clipboard.writeText(url);
      setShared(true);
    } catch {
      setShared(false);
    }

    window.setTimeout(() => setShared(false), 2000);
  }

  return (
    <button
      aria-label={ariaLabel}
      className={`focus-ring grid size-8 place-items-center rounded-full bg-white/95 text-ink shadow-[var(--shadow-sm)] transition hover:bg-white ${className}`}
      onClick={handleClick}
      title={ariaLabel}
      type="button"
    >
      <Icon name="share" size={14} />
      <span className="sr-only">{shared ? "تمت المشاركة" : ariaLabel}</span>
    </button>
  );
}
