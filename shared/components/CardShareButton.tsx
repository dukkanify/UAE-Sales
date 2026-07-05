"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/Button";
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
    <Button
      aria-label={shared ? "تمت المشاركة" : ariaLabel}
      className={`bg-white/95 shadow-[var(--shadow-sm)] hover:bg-white ${className}`}
      iconOnly
      onClick={handleClick}
      shape="pill"
      size="sm"
      title={ariaLabel}
      type="button"
      variant="outline"
    >
      <Icon className="shrink-0" name="send" size={14} />
      <span className="sr-only">{shared ? "تمت المشاركة" : ariaLabel}</span>
    </Button>
  );
}
