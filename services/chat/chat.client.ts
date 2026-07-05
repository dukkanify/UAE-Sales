import type {
  ChatConversation,
  ChatConversationDetail,
  ChatMessage,
  SendChatMessageInput,
} from "@/types/domain/chat";
import { apiClient, isApiConfigured } from "@/services/api";
import {
  addMockChatMessage,
  getMockChatConversationById,
  getMockChatConversations,
  getMockUnreadMessagesCount,
  getOrCreateMockConversationByListingSlug,
  markMockConversationRead,
} from "@/mock/chat.mock";
import { getSessionUser } from "@/services/storage";

async function fetchWithFallback<T>(
  path: string,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (isApiConfigured()) {
    try {
      return await apiClient<T>(path);
    } catch {
      // fall through
    }
  }
  return fallback();
}

export async function fetchChatConversations(): Promise<ChatConversation[]> {
  return fetchWithFallback("/api/chat/conversations", getMockChatConversations);
}

export async function fetchChatConversation(
  conversationId: string,
): Promise<ChatConversationDetail | undefined> {
  return fetchWithFallback(
    `/api/chat/conversations/${conversationId}`,
    () => getMockChatConversationById(conversationId, getSessionUser()?.id),
  );
}

export async function fetchUnreadMessagesCount(): Promise<number> {
  if (isApiConfigured()) {
    try {
      const result = await apiClient<{ count: number }>("/api/chat/unread-count");
      return result.count;
    } catch {
      // fall through
    }
  }
  return getMockUnreadMessagesCount();
}

export async function sendChatMessageClient(
  conversationId: string,
  input: SendChatMessageInput,
): Promise<ChatMessage | undefined> {
  const user = getSessionUser();

  if (isApiConfigured()) {
    try {
      return await apiClient<ChatMessage>(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
    } catch {
      // fall through
    }
  }

  return addMockChatMessage(
    conversationId,
    input,
    user?.id,
    user?.fullName,
  );
}

export async function markConversationReadClient(
  conversationId: string,
): Promise<ChatConversationDetail | undefined> {
  if (isApiConfigured()) {
    try {
      return await apiClient<ChatConversationDetail>(
        `/api/chat/conversations/${conversationId}/read`,
        { method: "PATCH" },
      );
    } catch {
      // fall through
    }
  }

  return markMockConversationRead(conversationId, getSessionUser()?.id);
}

export async function resolveListingConversationClient(
  listingSlug: string,
): Promise<ChatConversationDetail> {
  if (isApiConfigured()) {
    try {
      return await apiClient<ChatConversationDetail>(
        `/api/chat/conversations/by-listing/${listingSlug}`,
      );
    } catch {
      // fall through
    }
  }

  return getOrCreateMockConversationByListingSlug(
    listingSlug,
    getSessionUser()?.id,
  );
}
