import type { Listing } from "@/types";
import {
  getChatConversations,
  resolveOrCreateConversation,
} from "./chat-storage";

export type { ChatConversation, ChatMessage } from "./chat-storage";

export {
  addMessageToConversation,
  findConversationForListing,
  getChatConversationById,
  getChatConversations,
  getUnreadChatCount,
  markConversationRead,
  resolveOrCreateConversation,
} from "./chat-storage";

export async function getChatThreads() {
  if (typeof window === "undefined") return [];
  return getChatConversations().map((conversation) => ({
    id: conversation.id,
    listingTitle: conversation.listingTitle,
    participantName: conversation.sellerName,
    lastMessage:
      conversation.messages[conversation.messages.length - 1]?.body ?? "",
    lastMessageAt: conversation.updatedAt,
    unreadCount: 0,
    avatarUrl: undefined as string | undefined,
  }));
}

export function openListingConversation(
  listing: Listing,
  buyer: { id: string; name: string },
): string {
  const conversation = resolveOrCreateConversation({
    buyerId: buyer.id,
    buyerName: buyer.name,
    listing,
  });
  return conversation.id;
}
