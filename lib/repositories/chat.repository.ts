import type {
  ChatConversation,
  ChatConversationDetail,
  ChatMessage,
  SendChatMessageInput,
} from "@/types/domain/chat";
import { prisma } from "@/lib/prisma";
import { mapDbListing } from "@/lib/mappers";

const listingInclude = {
  seller: true,
  images: true,
} as const;

export function buildConversationId(
  userId: string,
  otherUserId: string,
  listingId: string,
): string {
  const participants = [userId, otherUserId].sort().join("__");
  return `${listingId}__${participants}`;
}

function parseConversationId(conversationId: string) {
  const separatorIndex = conversationId.indexOf("__");
  if (separatorIndex === -1) {
    return { listingId: "", userA: "", userB: "" };
  }

  const listingId = conversationId.slice(0, separatorIndex);
  const participants = conversationId.slice(separatorIndex + 2);
  const [userA, userB] = participants.split("__");
  return { listingId, userA: userA ?? "", userB: userB ?? "" };
}

export async function getChatConversationsFromDb(
  userId: string,
): Promise<ChatConversation[]> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      listingId: { not: null },
    },
    include: {
      sender: true,
      receiver: true,
      listing: { include: listingInclude },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<string, typeof messages>();

  for (const message of messages) {
    if (!message.listingId) {
      continue;
    }

    const otherUserId =
      message.senderId === userId ? message.receiverId : message.senderId;
    const conversationId = buildConversationId(
      userId,
      otherUserId,
      message.listingId,
    );

    const bucket = grouped.get(conversationId) ?? [];
    bucket.push(message);
    grouped.set(conversationId, bucket);
  }

  return Array.from(grouped.entries()).map(([conversationId, bucket]) => {
    const latest = bucket[0];
    const otherUser =
      latest.senderId === userId ? latest.receiver : latest.sender;
    const listing = latest.listing ? mapDbListing(latest.listing) : null;
    const unreadCount = bucket.filter(
      (message) => message.receiverId === userId && !message.read,
    ).length;

    return {
      id: conversationId,
      listingId: latest.listingId!,
      listingTitle: listing?.title ?? "إعلان",
      listingSlug: listing?.slug ?? "",
      listingImageUrl: listing?.imageUrl,
      listingPrice: listing?.price ?? 0,
      participantId: otherUser.id,
      participantName: otherUser.fullName,
      participantAvatarUrl: undefined,
      participantRole: "seller" as const,
      lastMessage: latest.message,
      lastMessageAt: latest.createdAt.toISOString(),
      unreadCount,
    };
  });
}

export async function getChatConversationFromDb(
  conversationId: string,
  userId: string,
): Promise<ChatConversationDetail | undefined> {
  const { listingId, userA, userB } = parseConversationId(conversationId);
  if (!listingId || !userA || !userB) {
    return undefined;
  }

  if (userId !== userA && userId !== userB) {
    return undefined;
  }

  const otherUserId = userId === userA ? userB : userA;

  const [messages, listing, otherUser] = await Promise.all([
    prisma.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.listing.findUnique({
      where: { id: listingId },
      include: listingInclude,
    }),
    prisma.user.findUnique({ where: { id: otherUserId } }),
  ]);

  if (!otherUser) {
    return undefined;
  }

  const mappedListing = listing ? mapDbListing(listing) : null;
  const last = messages.at(-1);

  return {
    id: conversationId,
    listingId,
    listingTitle: mappedListing?.title ?? "إعلان",
    listingSlug: mappedListing?.slug ?? "",
    listingImageUrl: mappedListing?.imageUrl,
    listingPrice: mappedListing?.price ?? 0,
    participantId: otherUser.id,
    participantName: otherUser.fullName,
    participantAvatarUrl: undefined,
    participantRole: "seller",
    lastMessage: last?.message ?? "",
    lastMessageAt: last?.createdAt.toISOString() ?? new Date().toISOString(),
    unreadCount: messages.filter(
      (message) => message.receiverId === userId && !message.read,
    ).length,
    messages: messages.map((message) => ({
      id: message.id,
      conversationId,
      senderId: message.senderId,
      senderName: message.sender.fullName,
      text: message.message,
      imageUrl: message.imageUrl ?? undefined,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
      isMine: message.senderId === userId,
    })),
  };
}

export async function sendChatMessageInDb(
  conversationId: string,
  userId: string,
  input: SendChatMessageInput,
): Promise<ChatMessage | undefined> {
  const conversation = await getChatConversationFromDb(conversationId, userId);
  if (!conversation) {
    return undefined;
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId: conversation.participantId,
      listingId: conversation.listingId,
      message: input.text,
      imageUrl: input.imageUrl,
      read: false,
    },
    include: { sender: true },
  });

  return {
    id: message.id,
    conversationId,
    senderId: message.senderId,
    senderName: message.sender.fullName,
    text: message.message,
    imageUrl: message.imageUrl ?? undefined,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
    isMine: true,
  };
}

export async function markChatConversationReadInDb(
  conversationId: string,
  userId: string,
): Promise<ChatConversationDetail | undefined> {
  const { listingId, userA, userB } = parseConversationId(conversationId);
  if (!listingId || !userA || !userB) {
    return undefined;
  }

  const otherUserId = userId === userA ? userB : userA;

  await prisma.message.updateMany({
    where: {
      listingId,
      senderId: otherUserId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  });

  return getChatConversationFromDb(conversationId, userId);
}

export async function getUnreadMessagesCountFromDb(userId: string): Promise<number> {
  return prisma.message.count({
    where: { receiverId: userId, read: false },
  });
}
