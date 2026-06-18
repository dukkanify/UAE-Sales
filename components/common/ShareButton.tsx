"use client";

import { useState } from "react";

type ShareButtonProps = {
  className?: string;
  title: string;
};

export function ShareButton({ className = "", title }: ShareButtonProps) {
  const [message, setMessage] = useState("مشاركة الإعلان");

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage("تمت المشاركة");
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage("تم نسخ الرابط");
    } catch {
      setMessage("الرابط جاهز للمشاركة");
    }
  }

  return (
    <button className={className} onClick={handleShare} type="button">
      {message}
    </button>
  );
}
