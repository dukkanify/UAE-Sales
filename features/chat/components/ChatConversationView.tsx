"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChatConversation } from "@/services/chat";
import {
  addMessageToConversation,
  getChatConversationById,
} from "@/services/chat";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";

type ChatConversationViewProps = {
  conversationId: string;
};

export function ChatConversationView({ conversationId }: ChatConversationViewProps) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setConversation(getChatConversationById(conversationId) ?? null);
      setIsReady(true);
    };
    sync();
    window.addEventListener(STORAGE_EVENTS.chatChange, sync);
    return () => window.removeEventListener(STORAGE_EVENTS.chatChange, sync);
  }, [conversationId]);

  if (!isReady) {
    return <Card className="p-6">جاري تحميل المحادثة...</Card>;
  }

  if (!conversation) {
    return (
      <EmptyState
        actionHref="/chat"
        actionLabel="العودة للرسائل"
        description="المحادثة غير موجودة في هذا المتصفح."
        icon="message"
        title="المحادثة غير موجودة"
      />
    );
  }

  const user = getSessionUser();
  const listingHref = conversation.listingId.startsWith("local-")
    ? `/listings/local/${conversation.listingId}`
    : `/listings/${conversation.listingSlug}`;

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("يلزم تسجيل الدخول لإرسال الرسائل.");
      return;
    }

    if (!message.trim()) {
      setError("اكتب رسالة قبل الإرسال.");
      return;
    }

    if (!conversation) {
      setError("المحادثة غير متاحة.");
      return;
    }

    const updated = addMessageToConversation(
      conversation.id,
      user.id,
      message.trim(),
    );

    if (!updated) {
      setError("تعذر إرسال الرسالة.");
      return;
    }

    setConversation(updated);
    setMessage("");
  }

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{conversation.listingTitle}</p>
            <p className="mt-1 text-xs text-muted">
              مع {conversation.sellerName}
            </p>
          </div>
          <Button href={listingHref} size="sm" variant="secondary">
            عرض الإعلان
          </Button>
        </div>
      </Card>

      <Card className="flex min-h-[24rem] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {conversation.messages.map((item) => {
            const isMine = user?.id === item.senderId;
            return (
              <div
                key={item.id}
                className={`max-w-[85%] rounded-[var(--radius-xl)] px-4 py-3 text-sm ${
                  isMine
                    ? "ms-auto bg-primary text-white"
                    : "bg-surface-muted text-ink"
                }`}
              >
                <p>{item.body}</p>
                <p className={`mt-1 text-[0.65rem] ${isMine ? "text-white/70" : "text-muted"}`}>
                  {new Date(item.createdAt).toLocaleString("ar-AE", {
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            );
          })}
        </div>

        <form className="mt-4 grid gap-2 border-t border-border pt-4" onSubmit={handleSend}>
          <Input
            label="رسالتك"
            name="message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="اكتب رسالتك هنا..."
            value={message}
          />
          {error ? <FormMessage variant="error">{error}</FormMessage> : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="submit" variant="primary">
              إرسال
            </Button>
            <Link className="text-sm font-medium text-muted hover:text-ink" href="/chat">
              كل المحادثات
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
