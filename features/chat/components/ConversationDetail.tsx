"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatConversationDetail } from "@/types/domain/chat";
import { ListingPreviewPanel } from "@/features/chat/components/ListingPreviewPanel";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { MessageInput } from "@/features/chat/components/MessageInput";
import {
  fetchChatConversation,
  markConversationReadClient,
  sendChatMessageClient,
} from "@/services/chat/chat.client";
import { AppImage } from "@/shared/components/AppImage";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";

type ConversationDetailProps = {
  conversationId: string;
};

export function ConversationDetail({ conversationId }: ConversationDetailProps) {
  const [conversation, setConversation] = useState<ChatConversationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    const data = await fetchChatConversation(conversationId);
    if (data) {
      setConversation(data);
      if (data.unreadCount > 0) {
        const updated = await markConversationReadClient(conversationId);
        if (updated) {
          setConversation(updated);
        }
      }
    }
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadConversation();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadConversation]);

  async function handleSend(payload: { text: string; imageUrl?: string }) {
    const message = await sendChatMessageClient(conversationId, payload);
    if (!message) {
      return;
    }

    setConversation((current) =>
      current
        ? {
            ...current,
            messages: [...current.messages, message],
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
          }
        : current,
    );
  }

  if (loading) {
    return (
      <Card className="marketplace-panel flex h-full min-h-[28rem] flex-col overflow-hidden" variant="flat">
        <div className="border-b border-border p-4">
          <Skeleton height="1rem" width="40%" />
          <Skeleton className="mt-2" height="0.75rem" width="60%" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height="3rem" width={index % 2 ? "70%" : "55%"} />
          ))}
        </div>
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card className="marketplace-panel p-8" variant="flat">
        <EmptyState
          actionHref="/chat"
          actionLabel="العودة للمحادثات"
          description="قد تكون المحادثة محذوفة أو غير متاحة."
          icon="message"
          title="المحادثة غير موجودة"
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_16rem]">
      <Card
        className="marketplace-panel flex min-h-[28rem] flex-col overflow-hidden"
        variant="flat"
      >
        <div className="flex items-center gap-3 border-b border-border p-4">
          <span className="relative size-11 overflow-hidden rounded-full">
            <AppImage
              alt={conversation.participantName}
              className="object-cover"
              fallback="avatar"
              fill
              sizes="44px"
              src={conversation.participantAvatarUrl}
            />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              {conversation.participantName}
            </p>
            <p className="text-xs text-muted">
              {conversation.participantRole === "seller" ? "بائع" : "مشتري"} ·{" "}
              {conversation.listingTitle}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {conversation.messages.length === 0 ? (
            <EmptyState
              description="ابدأ التواصل مع الطرف الآخر حول هذا الإعلان."
              icon="message"
              title="لا توجد رسائل بعد"
            />
          ) : (
            conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>

        <MessageInput onSend={handleSend} />
      </Card>

      <ListingPreviewPanel conversation={conversation} />
    </div>
  );
}
