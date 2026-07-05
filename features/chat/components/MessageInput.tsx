"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

type MessageInputProps = {
  disabled?: boolean;
  onSend: (payload: { text: string; imageUrl?: string }) => Promise<void>;
};

const mockImageUrl =
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80";

export function MessageInput({ disabled = false, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | undefined>();

  async function handleSubmit() {
    if (!text.trim() && !attachedImage) {
      return;
    }

    setSending(true);
    await onSend({ text: text.trim(), imageUrl: attachedImage });
    setText("");
    setAttachedImage(undefined);
    setSending(false);
  }

  return (
    <div className="border-t border-border bg-surface p-4">
      {attachedImage ? (
        <div className="mb-3 flex items-center justify-between rounded-[var(--radius-xl)] border border-border px-3 py-2 text-xs text-muted">
          <span>صورة مرفقة (تجريبي)</span>
          <button
            className="font-medium text-accent"
            onClick={() => setAttachedImage(undefined)}
            type="button"
          >
            إزالة
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <button
          aria-label="إرفاق صورة"
          className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-xl)] border border-border text-muted transition hover:bg-surface-muted"
          disabled={disabled || sending}
          onClick={() => setAttachedImage(mockImageUrl)}
          type="button"
        >
          <Icon name="photo" size={18} />
        </button>
        <textarea
          className="min-h-11 flex-1 resize-none rounded-[var(--radius-xl)] border border-border bg-surface-muted/40 px-4 py-3 text-sm outline-none focus:border-primary/40"
          disabled={disabled || sending}
          onChange={(event) => setText(event.target.value)}
          placeholder="اكتب رسالتك..."
          rows={1}
          value={text}
        />
        <Button
          disabled={disabled || sending || (!text.trim() && !attachedImage)}
          onClick={handleSubmit}
          size="sm"
          variant="primary"
        >
          إرسال
        </Button>
      </div>
    </div>
  );
}
