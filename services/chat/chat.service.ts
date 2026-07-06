import type {
  ChatConversation,
  ChatConversationDetail,
  ChatMessage,
  SendChatMessageInput,
} from "@/types/domain/chat";
import { withDataFallback } from "@/lib/data/fallback";
import {
  getChatConversationFromDb,
  getChatConversationsFromDb,
  getUnreadMessagesCountFromDb,
} from "@/lib/repositories/chat.repository";
import {
  getMockChatConversationById,
  getMockChatConversations,
  getMockUnreadMessagesCount,
  getOrCreateMockConversationByListingSlug,
} from "@/mock/chat.mock";

async function getSessionUserId(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return null;
  }
  const { getCurrentSessionUser } = await import("@/lib/auth/session");
  const user = await getCurrentSessionUser();
  return user?.id ?? null;
}

export async function getChatConversations(): Promise<ChatConversation[]> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return getMockChatConversations();
      }
      return getChatConversationsFromDb(userId);
    },
    () => getMockChatConversations(),
    "chat-conversations",
  );
}

export async function getChatConversation(
  conversationId: string,
): Promise<ChatConversationDetail | undefined> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return getMockChatConversationById(conversationId);
      }
      return getChatConversationFromDb(conversationId, userId);
    },
    () => getMockChatConversationById(conversationId),
    "chat-conversation",
  );
}

export async function getUnreadMessagesCount(): Promise<number> {
  return withDataFallback(
    async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        return getMockUnreadMessagesCount();
      }
      return getUnreadMessagesCountFromDb(userId);
    },
    getMockUnreadMessagesCount,
    "chat-unread-count",
  );
}

export async function getConversationForListingSlug(
  listingSlug: string,
): Promise<ChatConversationDetail> {
  const userId = (await getSessionUserId()) ?? "demo-user-001";
  return getOrCreateMockConversationByListingSlug(listingSlug, userId);
}

export type {
  ChatConversation,
  ChatConversationDetail,
  ChatMessage,
  SendChatMessageInput,
};
