"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

type CardShareButtonProps = {
  ariaLabel?: string;
  className?: string;
  title: string;
  url: string;
};

function resolveShareUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

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

    const shareUrl = resolveShareUrl(url);

    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        setShared(true);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
    } catch {
      setShared(false);
    }

    window.setTimeout(() => setShared(false), 2000);
  }

  return (
    <button
      aria-label={ariaLabel}
      className={`card-media-action focus-ring grid size-8 place-items-center rounded-full transition ${className}`}
      onClick={handleClick}
      title={ariaLabel}
      type="button"
    >
      <Icon name="share-2" size={15} />
      <span className="sr-only">{shared ? "تمت المشاركة" : ariaLabel}</span>
    </button>
  );
}
