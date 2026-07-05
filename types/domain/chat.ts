export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  read: boolean;
  createdAt: string;
  isMine?: boolean;
};

export type ChatConversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  listingImageUrl?: string;
  listingPrice: number;
  participantId: string;
  participantName: string;
  participantAvatarUrl?: string;
  participantRole: "buyer" | "seller";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isDisputeRelated?: boolean;
};

export type ChatConversationDetail = ChatConversation & {
  messages: ChatMessage[];
};

export type SendChatMessageInput = {
  text: string;
  imageUrl?: string;
};
