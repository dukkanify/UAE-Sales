import { STORAGE_EVENTS, STORAGE_KEYS } from "@/shared/constants/brand";
import type { Listing } from "@/types";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
};

export type ChatConversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  lastReadAt?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readConversations(): ChatConversation[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.chatConversations);
    return raw ? (JSON.parse(raw) as ChatConversation[]) : [];
  } catch {
    return [];
  }
}

function writeConversations(conversations: ChatConversation[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    STORAGE_KEYS.chatConversations,
    JSON.stringify(conversations),
  );
  window.dispatchEvent(new Event(STORAGE_EVENTS.chatChange));
}

export function getChatConversations(): ChatConversation[] {
  return readConversations().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getChatConversationById(
  conversationId: string,
): ChatConversation | undefined {
  return readConversations().find((item) => item.id === conversationId);
}

export function findConversationForListing(
  listingId: string,
  buyerId: string,
): ChatConversation | undefined {
  return readConversations().find(
    (item) => item.listingId === listingId && item.buyerId === buyerId,
  );
}

type ResolveConversationInput = {
  buyerId: string;
  buyerName: string;
  listing: Listing;
};

export function resolveOrCreateConversation({
  buyerId,
  buyerName,
  listing,
}: ResolveConversationInput): ChatConversation {
  const existing = findConversationForListing(listing.id, buyerId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const conversation: ChatConversation = {
    id: `chat-${listing.id}-${buyerId}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingSlug: listing.slug,
    sellerId: listing.seller.id,
    sellerName: listing.seller.name,
    buyerId,
    buyerName,
    messages: [
      {
        id: `msg-${Date.now()}`,
        body: `مرحباً، أنا مهتم بإعلان «${listing.title}».`,
        createdAt: now,
        senderId: buyerId,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const conversations = readConversations();
  writeConversations([conversation, ...conversations]);
  return conversation;
}

export function addMessageToConversation(
  conversationId: string,
  senderId: string,
  body: string,
): ChatConversation | undefined {
  const conversations = readConversations();
  const index = conversations.findIndex((item) => item.id === conversationId);
  if (index < 0) return undefined;

  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    body: body.trim(),
    createdAt: now,
    senderId,
  };

  const updated: ChatConversation = {
    ...conversations[index],
    messages: [...conversations[index].messages, message],
    updatedAt: now,
  };

  conversations[index] = updated;
  writeConversations(conversations);
  return updated;
}

export function getConversationUnreadCount(
  conversation: ChatConversation,
  userId: string,
): number {
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return 0;
  }
  const lastRead = conversation.lastReadAt
    ? new Date(conversation.lastReadAt).getTime()
    : 0;
  return conversation.messages.filter(
    (item) =>
      item.senderId !== userId && new Date(item.createdAt).getTime() > lastRead,
  ).length;
}

/** Unread messages in this browser only — never uses demo/placeholder threads. */
export function getUnreadChatCount(userId?: string | null): number {
  if (!userId) return 0;
  return readConversations().reduce(
    (sum, conversation) => sum + getConversationUnreadCount(conversation, userId),
    0,
  );
}

export function markConversationRead(conversationId: string): void {
  const conversations = readConversations();
  const index = conversations.findIndex((item) => item.id === conversationId);
  if (index < 0) return;

  const current = conversations[index];
  if (current.lastReadAt && current.lastReadAt >= current.updatedAt) return;

  conversations[index] = {
    ...current,
    lastReadAt: new Date().toISOString(),
  };
  writeConversations(conversations);
}

/** Kept for callers that still import it — no fake inbox threads. */
export async function getDemoChatThreads() {
  return [];
}
