"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

type ShareButtonProps = {
  className?: string;
  title: string;
};

const baseClass =
  "focus-ring interactive-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 text-sm font-semibold text-ink transition";

export function ShareButton({ className = "", title }: ShareButtonProps) {
  const [message, setMessage] = useState("مشاركة");

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage("تمت المشاركة");
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage("تم النسخ");
    } catch {
      setMessage("مشاركة");
    }
  }

  return (
    <button className={`${baseClass} ${className}`} onClick={handleShare} type="button">
      <Icon name="send" size={16} />
      {message}
    </button>
  );
}
