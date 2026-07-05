"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

type ShareButtonProps = {
  className?: string;
  title: string;
};

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
    <Button className={className} onClick={handleShare} size="md" type="button" variant="outline">
      <Icon className="shrink-0" name="send" size={16} />
      {message}
    </Button>
  );
}
