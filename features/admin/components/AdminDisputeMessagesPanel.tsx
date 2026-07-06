"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMockDisputeRelatedConversations } from "@/mock/chat.mock";
import type { ChatConversation } from "@/types/domain/chat";
import { Card } from "@/shared/ui/Card";

export function AdminDisputeMessagesPanel() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setConversations(getMockDisputeRelatedConversations());
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (conversations.length === 0) {
    return null;
  }

  return (
    <Card className="marketplace-panel p-5" variant="flat">
      <h3 className="text-sm font-semibold text-ink">رسائل مرتبطة بالنزاعات</h3>
      <ul className="mt-4 grid gap-2 text-sm">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <Link
              className="block rounded-[var(--radius-xl)] border border-border/60 px-3 py-2 transition hover:bg-surface-muted"
              href={`/chat/${conversation.id}`}
            >
              <p className="font-medium text-ink">{conversation.listingTitle}</p>
              <p className="mt-1 text-xs text-muted">
                {conversation.participantName} · {conversation.lastMessage}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
