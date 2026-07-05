import type { ChatConversation, ChatConversationDetail, ChatMessage } from "@/types/domain/chat";
import { marketplaceListings } from "@/mock/listings.mock";
import { sellerAvatarUrls } from "@/shared/constants/image-fallbacks";

const demoUserId = "demo-user-001";

function findListing(slugOrId: string) {
  return marketplaceListings.find(
    (listing) => listing.slug === slugOrId || listing.id === slugOrId,
  );
}

const initialConversations: ChatConversationDetail[] = [
  {
    id: "thread-001",
    listingId: "listing-car-003",
    listingTitle: "نيسان باترول بلاتينيوم 2022",
    listingSlug: "nissan-patrol-platinum-2022",
    listingImageUrl: findListing("nissan-patrol-platinum-2022")?.imageUrl,
    listingPrice: 195000,
    participantId: "seller-khalid",
    participantName: "خالد المنصوري",
    participantAvatarUrl: sellerAvatarUrls.khalidAlMansoori,
    participantRole: "seller",
    lastMessage: "متى يمكنني معاينة السيارة في ياس؟",
    lastMessageAt: "2026-07-04T16:20:00+04:00",
    unreadCount: 2,
    isDisputeRelated: true,
    messages: [
      {
        id: "msg-001",
        conversationId: "thread-001",
        senderId: "seller-khalid",
        senderName: "خالد المنصوري",
        text: "مرحباً، السيارة متوفرة للمعاينة في ياس.",
        read: true,
        createdAt: "2026-07-04T14:00:00+04:00",
      },
      {
        id: "msg-002",
        conversationId: "thread-001",
        senderId: demoUserId,
        senderName: "Ahmed Al Mansoori",
        text: "هل السعر قابل للتفاوض؟",
        read: true,
        createdAt: "2026-07-04T15:10:00+04:00",
      },
      {
        id: "msg-003",
        conversationId: "thread-001",
        senderId: "seller-khalid",
        senderName: "خالد المنصوري",
        text: "يمكننا مناقشة السعر بعد المعاينة.",
        read: false,
        createdAt: "2026-07-04T15:45:00+04:00",
      },
      {
        id: "msg-004",
        conversationId: "thread-001",
        senderId: "seller-khalid",
        senderName: "خالد المنصوري",
        text: "متى يمكنني معاينة السيارة في ياس؟",
        read: false,
        createdAt: "2026-07-04T16:20:00+04:00",
      },
    ],
  },
  {
    id: "thread-002",
    listingId: "listing-mobile-002",
    listingTitle: "آيفون 15 برو 128 جيجابايت",
    listingSlug: "iphone-15-pro-128gb",
    listingImageUrl: findListing("iphone-15-pro-128gb")?.imageUrl,
    listingPrice: 3200,
    participantId: "seller-gulf-electronics",
    participantName: "إلكترونيات الخليج",
    participantAvatarUrl: sellerAvatarUrls.gulfElectronics,
    participantRole: "seller",
    lastMessage: "الجهاز متوفر، يمكن التسليم اليوم في المجاز.",
    lastMessageAt: "2026-07-04T11:05:00+04:00",
    unreadCount: 0,
    messages: [
      {
        id: "msg-101",
        conversationId: "thread-002",
        senderId: demoUserId,
        senderName: "Ahmed Al Mansoori",
        text: "هل الجهاز بحالة ممتازة؟",
        read: true,
        createdAt: "2026-07-04T10:00:00+04:00",
      },
      {
        id: "msg-102",
        conversationId: "thread-002",
        senderId: "seller-gulf-electronics",
        senderName: "إلكترونيات الخليج",
        text: "الجهاز متوفر، يمكن التسليم اليوم في المجاز.",
        read: true,
        createdAt: "2026-07-04T11:05:00+04:00",
      },
    ],
  },
  {
    id: "thread-003",
    listingId: "listing-re-001",
    listingTitle: "فيلا نخلة جميرا",
    listingSlug: "villa-palm-jumeirah",
    listingImageUrl: findListing("villa-palm-jumeirah")?.imageUrl,
    listingPrice: 18500000,
    participantId: "seller-dubai-elite",
    participantName: "دبي إيليت للعقارات",
    participantAvatarUrl: sellerAvatarUrls.dubaiElite,
    participantRole: "seller",
    lastMessage: "أرسلت لك جدول المعاينة ليوم السبت.",
    lastMessageAt: "2026-07-03T18:40:00+04:00",
    unreadCount: 1,
    messages: [
      {
        id: "msg-201",
        conversationId: "thread-003",
        senderId: "seller-dubai-elite",
        senderName: "دبي إيليت للعقارات",
        text: "أرسلت لك جدول المعاينة ليوم السبت.",
        read: false,
        createdAt: "2026-07-03T18:40:00+04:00",
      },
    ],
  },
];

let mockConversations = structuredClone(initialConversations);

function toConversation(detail: ChatConversationDetail): ChatConversation {
  const { messages, ...conversation } = detail;
  void messages;
  return conversation;
}

function refreshConversationMeta(conversation: ChatConversationDetail) {
  const last = conversation.messages.at(-1);
  if (last) {
    conversation.lastMessage = last.text;
    conversation.lastMessageAt = last.createdAt;
  }
  conversation.unreadCount = conversation.messages.filter(
    (message) => !message.read && message.senderId !== demoUserId,
  ).length;
}

export function getMockChatConversations(userId = demoUserId): ChatConversation[] {
  return mockConversations.map((conversation) =>
    toConversation({
      ...conversation,
      messages: conversation.messages.map((message) => ({
        ...message,
        isMine: message.senderId === userId,
      })),
    }),
  );
}

export function getMockChatConversationById(
  conversationId: string,
  userId = demoUserId,
): ChatConversationDetail | undefined {
  const conversation = mockConversations.find((item) => item.id === conversationId);
  if (!conversation) {
    return undefined;
  }

  return {
    ...conversation,
    messages: conversation.messages.map((message) => ({
      ...message,
      isMine: message.senderId === userId,
    })),
  };
}

export function getMockUnreadMessagesCount(userId = demoUserId): number {
  return mockConversations.reduce((sum, conversation) => {
    const unread = conversation.messages.filter(
      (message) => !message.read && message.senderId !== userId,
    ).length;
    return sum + unread;
  }, 0);
}

export function addMockChatMessage(
  conversationId: string,
  input: { text: string; imageUrl?: string },
  userId = demoUserId,
  userName = "Ahmed Al Mansoori",
): ChatMessage | undefined {
  const conversation = mockConversations.find((item) => item.id === conversationId);
  if (!conversation) {
    return undefined;
  }

  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: userId,
    senderName: userName,
    text: input.text,
    imageUrl: input.imageUrl,
    read: true,
    createdAt: new Date().toISOString(),
    isMine: true,
  };

  conversation.messages.push(message);
  refreshConversationMeta(conversation);
  return message;
}

export function markMockConversationRead(
  conversationId: string,
  userId = demoUserId,
): ChatConversationDetail | undefined {
  const conversation = mockConversations.find((item) => item.id === conversationId);
  if (!conversation) {
    return undefined;
  }

  conversation.messages = conversation.messages.map((message) =>
    message.senderId !== userId ? { ...message, read: true } : message,
  );
  refreshConversationMeta(conversation);

  return getMockChatConversationById(conversationId, userId);
}

export function getOrCreateMockConversationByListingSlug(
  listingSlug: string,
  userId = demoUserId,
): ChatConversationDetail {
  const existing = mockConversations.find(
    (conversation) => conversation.listingSlug === listingSlug,
  );
  if (existing) {
    return getMockChatConversationById(existing.id, userId)!;
  }

  const listing = findListing(listingSlug);
  if (!listing) {
    return getMockChatConversationById("thread-002", userId)!;
  }

  const conversation: ChatConversationDetail = {
    id: `thread-${Date.now()}`,
    listingId: listing.id,
    listingTitle: listing.title,
    listingSlug: listing.slug,
    listingImageUrl: listing.imageUrl,
    listingPrice: listing.price,
    participantId: listing.seller.id,
    participantName: listing.seller.name,
    participantAvatarUrl: listing.seller.avatarUrl,
    participantRole: "seller",
    lastMessage: "مرحباً، كيف يمكنني مساعدتك؟",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversationId: `thread-${Date.now()}`,
        senderId: listing.seller.id,
        senderName: listing.seller.name,
        text: "مرحباً، كيف يمكنني مساعدتك بخصوص هذا الإعلان؟",
        read: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  conversation.messages[0].conversationId = conversation.id;
  mockConversations = [conversation, ...mockConversations];
  return getMockChatConversationById(conversation.id, userId)!;
}

export function getMockDisputeRelatedConversations(): ChatConversation[] {
  return mockConversations
    .filter((conversation) => conversation.isDisputeRelated)
    .map((conversation) => toConversation(conversation));
}

export function resetMockChatData() {
  mockConversations = structuredClone(initialConversations);
}
