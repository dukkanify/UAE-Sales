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

/** Server-safe demo threads for inbox when no local conversations exist */
export async function getDemoChatThreads() {
  return [
    {
      id: "thread-001",
      listingTitle: "نيسان باترول بلاتينيوم 2022",
      participantName: "خالد المنصوري",
      lastMessage: "متى يمكنني معاينة السيارة في ياس؟",
      lastMessageAt: "2026-07-04T16:20:00+04:00",
      unreadCount: 2,
      avatarUrl: "/brand/logo-icon.svg",
    },
  ];
}
