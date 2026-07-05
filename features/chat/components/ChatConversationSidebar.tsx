"use client";

import { useEffect, useState } from "react";
import type { ChatConversation } from "@/types/domain/chat";
import { ConversationList } from "@/features/chat/components/ConversationList";
import { fetchChatConversations } from "@/services/chat/chat.client";

type ChatConversationSidebarProps = {
  activeId?: string;
};

export function ChatConversationSidebar({ activeId }: ChatConversationSidebarProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchChatConversations()
        .then(setConversations)
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <ConversationList
      activeId={activeId}
      conversations={conversations}
      loading={loading}
    />
  );
}
