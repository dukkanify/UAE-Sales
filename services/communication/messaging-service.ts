/**
 * Private + group + support messaging service (enterprise).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import {
  MESSAGE_DELETE_WINDOW_MS,
  PRESENCE_TTL_MS,
  TYPING_TTL_MS,
} from "@/constants/communication";
import { ROLES } from "@/constants/roles";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import {
  assertCanMessage,
  assertCanMessagePeer,
  CommunicationError,
  isStaffRole,
} from "@/services/communication/access";
import { moderateText } from "@/services/communication/moderation-service";
import { notifyUsers } from "@/services/communication/notify";
import { readCommunicationDb, writeCommunicationDb } from "@/services/communication/store";
import type {
  AttachmentRef,
  Conversation,
  ConversationKind,
  Message,
  MessageReactionEmoji,
  MessageShareKind,
  PresenceState,
  TypingState,
} from "@/types/communication";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function displayName(userId: string): string {
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) return "User";
  const p = toUserProfile(u);
  return p.fullName || p.email;
}

function roleSegment(role: string): string {
  if (role === ROLES.SUPER_ADMIN) return "super-admin";
  if (role === ROLES.CHIEF_GROUND_INSTRUCTOR) return "cgi";
  return role;
}

function messagesHref(userId: string, conversationId: string): string {
  const u = readAuthDb().users.find((x) => x.id === userId);
  const seg = u ? roleSegment(u.role) : "student";
  return `/${seg}/messages?c=${conversationId}`;
}

function normalizeMessage(m: Message): Message {
  return {
    ...m,
    shareKind: m.shareKind ?? "text",
    replyToId: m.replyToId ?? null,
    replyPreview: m.replyPreview ?? null,
    reactions: m.reactions ?? [],
    pinned: Boolean(m.pinned),
  };
}

export function listConversationsForUser(
  user: UserProfile,
  options?: { q?: string; includeArchived?: boolean },
): Conversation[] {
  assertCanMessage(user);
  let rows = readCommunicationDb().conversations.filter(
    (c) => !c.deletedAt && c.participantIds.includes(user.id),
  );
  if (!options?.includeArchived) {
    rows = rows.filter((c) => !c.participants.find((p) => p.userId === user.id)?.archived);
  }
  if (options?.q) {
    const q = options.q.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || (c.lastMessagePreview ?? "").toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) =>
    (b.lastMessageAt ?? b.updatedAt).localeCompare(a.lastMessageAt ?? a.updatedAt),
  );
}

export function getConversation(id: string): Conversation | null {
  return readCommunicationDb().conversations.find((c) => c.id === id && !c.deletedAt) ?? null;
}

export function assertParticipant(user: UserProfile, conversationId: string): Conversation {
  const conv = getConversation(conversationId);
  if (!conv) throw new CommunicationError("Conversation not found", 404);
  if (!conv.participantIds.includes(user.id) && user.role !== ROLES.SUPER_ADMIN) {
    throw new CommunicationError("Not a participant", 403);
  }
  return conv;
}

export async function startDirectConversation(input: {
  user: UserProfile;
  peerUserId: string;
}): Promise<Conversation> {
  const peer = readAuthDb().users.find((u) => u.id === input.peerUserId);
  if (!peer) throw new CommunicationError("User not found", 404);
  assertCanMessagePeer(input.user, peer.role);

  const existing = readCommunicationDb().conversations.find(
    (c) =>
      c.kind === "direct" &&
      !c.deletedAt &&
      c.participantIds.includes(input.user.id) &&
      c.participantIds.includes(peer.id) &&
      c.participantIds.length === 2,
  );
  if (existing) return existing;

  const stamp = nowIso();
  const peerName = displayName(peer.id);
  const conv: Conversation = {
    id: generateId(),
    kind: "direct",
    title: peerName,
    courseId: null,
    classId: null,
    createdById: input.user.id,
    participantIds: [input.user.id, peer.id],
    participants: [
      {
        userId: input.user.id,
        role: "owner",
        joinedAt: stamp,
        lastReadAt: stamp,
        muted: false,
        archived: false,
      },
      {
        userId: peer.id,
        role: "member",
        joinedAt: stamp,
        lastReadAt: null,
        muted: false,
        archived: false,
      },
    ],
    lastMessageAt: null,
    lastMessagePreview: null,
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.conversations.unshift(conv);
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.MESSAGE_CONVERSATION_STARTED,
    entityType: "conversation",
    entityId: conv.id,
    metadata: { peerUserId: peer.id },
  });

  return conv;
}

/** Persistent support inbox — student never loses history. */
export async function getOrCreateSupportConversation(user: UserProfile): Promise<Conversation> {
  assertCanMessage(user);
  const existing = readCommunicationDb().conversations.find(
    (c) =>
      c.kind === "support" &&
      !c.deletedAt &&
      c.participantIds.includes(user.id) &&
      c.createdById === user.id,
  );
  if (existing) return existing;

  const supportAgents = readAuthDb().users.filter(
    (u) => u.status === "active" && (u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN),
  );
  const ids = [...new Set([user.id, ...supportAgents.map((a) => a.id)])];
  const stamp = nowIso();
  const conv: Conversation = {
    id: generateId(),
    kind: "support",
    title: "Support",
    courseId: null,
    classId: null,
    createdById: user.id,
    participantIds: ids,
    participants: ids.map((userId) => ({
      userId,
      role: userId === user.id ? "owner" : "admin",
      joinedAt: stamp,
      lastReadAt: userId === user.id ? stamp : null,
      muted: false,
      archived: false,
    })),
    lastMessageAt: null,
    lastMessagePreview: null,
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.conversations.unshift(conv);
    db.messages.push({
      id: generateId(),
      conversationId: conv.id,
      senderId: "system",
      senderName: "AviatorPass Support",
      body: "Welcome to Support. Describe your issue and our team will reply here. All history stays in this conversation.",
      attachments: [],
      deliveryStatus: "delivered",
      shareKind: "system",
      replyToId: null,
      replyPreview: null,
      reactions: [],
      pinned: true,
      moderated: false,
      moderationFlags: [],
      deletedAt: null,
      createdAt: stamp,
      updatedAt: stamp,
    });
    conv.lastMessageAt = stamp;
    conv.lastMessagePreview = "Welcome to Support…";
  });

  return conv;
}

export async function createGroupConversation(input: {
  user: UserProfile;
  kind: Exclude<ConversationKind, "direct" | "support">;
  title: string;
  participantIds: string[];
  courseId?: string | null;
  classId?: string | null;
}): Promise<Conversation> {
  assertCanMessage(input.user);
  if (input.user.role === "student" && input.kind !== "study_group") {
    throw new CommunicationError("Students may only create study groups", 403);
  }
  if (
    (input.kind === "admin_group" || input.kind === "instructor_group") &&
    input.user.role === "student"
  ) {
    throw new CommunicationError("Insufficient permission to create this group", 403);
  }

  const ids = [...new Set([input.user.id, ...input.participantIds])];
  for (const id of ids) {
    if (id === input.user.id) continue;
    const peer = readAuthDb().users.find((u) => u.id === id);
    if (peer) assertCanMessagePeer(input.user, peer.role);
  }

  const stamp = nowIso();
  const conv: Conversation = {
    id: generateId(),
    kind: input.kind,
    title: input.title.trim() || "Group chat",
    courseId: input.courseId ?? null,
    classId: input.classId ?? null,
    createdById: input.user.id,
    participantIds: ids,
    participants: ids.map((userId) => ({
      userId,
      role: userId === input.user.id ? "owner" : "member",
      joinedAt: stamp,
      lastReadAt: userId === input.user.id ? stamp : null,
      muted: false,
      archived: false,
    })),
    lastMessageAt: null,
    lastMessagePreview: null,
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.conversations.unshift(conv);
  });

  await Promise.all(
    ids
      .filter((id) => id !== input.user.id)
      .map((id) =>
        notifyUsers([id], {
          title: "Added to group conversation",
          body: `You were added to “${conv.title}”.`,
          type: "message.group_added",
          data: { conversationId: conv.id },
          actionUrl: messagesHref(id, conv.id),
        }),
      ),
  );

  return conv;
}

export function listMessages(
  user: UserProfile,
  conversationId: string,
  options?: { before?: string; limit?: number; q?: string },
): Message[] {
  assertParticipant(user, conversationId);
  const limit = options?.limit ?? 50;
  let rows = readCommunicationDb()
    .messages.filter((m) => m.conversationId === conversationId && !m.deletedAt)
    .map(normalizeMessage);
  if (options?.q) {
    const q = options.q.toLowerCase();
    rows = rows.filter((m) => m.body.toLowerCase().includes(q));
  }
  rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (options?.before) {
    rows = rows.filter((m) => m.createdAt < options.before!);
  }
  return rows.slice(-limit);
}

export async function sendMessage(input: {
  user: UserProfile;
  conversationId: string;
  body: string;
  attachments?: AttachmentRef[];
  replyToId?: string | null;
  shareKind?: MessageShareKind;
  clientId?: string | null;
}): Promise<Message> {
  const conv = assertParticipant(input.user, input.conversationId);

  const body = input.body.trim();
  if (!body && !input.attachments?.length) {
    throw new CommunicationError("Message body required");
  }

  const recent = readCommunicationDb()
    .messages.filter((m) => m.senderId === input.user.id)
    .slice(0, 5)
    .map((m) => m.body);

  const id = generateId();
  const moderation = moderateText(body, {
    contentType: "message",
    contentId: id,
    actorId: input.user.id,
    recentBodies: recent,
  });
  if (!moderation.allowed) {
    throw new CommunicationError(
      "Message blocked by content moderation. Phone numbers, emails, and abusive language are not allowed.",
      422,
    );
  }

  let replyPreview: string | null = null;
  if (input.replyToId) {
    const parent = getMessage(input.replyToId);
    if (parent && parent.conversationId === conv.id) {
      replyPreview = `${parent.senderName}: ${parent.body.slice(0, 80)}`;
    }
  }

  const stamp = nowIso();
  const message: Message = {
    id,
    conversationId: conv.id,
    senderId: input.user.id,
    senderName: input.user.fullName || input.user.email,
    body: moderation.redactedBody ?? body,
    attachments: input.attachments ?? [],
    deliveryStatus: "sent",
    shareKind: input.shareKind ?? "text",
    replyToId: input.replyToId ?? null,
    replyPreview,
    reactions: [],
    pinned: false,
    moderated: moderation.flags.length > 0,
    moderationFlags: moderation.flags,
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.messages.push(message);
    const c = db.conversations.find((x) => x.id === conv.id);
    if (c) {
      c.lastMessageAt = stamp;
      c.lastMessagePreview = message.body.slice(0, 120);
      c.updatedAt = stamp;
      const me = c.participants.find((p) => p.userId === input.user.id);
      if (me) me.lastReadAt = stamp;
    }
    message.deliveryStatus = "delivered";
    const stored = db.messages.find((m) => m.id === id);
    if (stored) stored.deliveryStatus = "delivered";
  });

  const recipients = conv.participantIds.filter((uid) => {
    if (uid === input.user.id) return false;
    const p = conv.participants.find((x) => x.userId === uid);
    return !p?.muted;
  });

  const shareLabel =
    message.shareKind !== "text" && message.shareKind !== "system"
      ? `[${message.shareKind.replaceAll("_", " ")}] `
      : "";

  const notifType =
    message.shareKind !== "text" && message.shareKind !== "system"
      ? "document.shared"
      : conv.kind === "support"
        ? "ticket.reply"
        : "message.new";

  await Promise.all(
    recipients.map((uid) =>
      notifyUsers([uid], {
        title:
          notifType === "document.shared"
            ? "Document shared"
            : conv.kind === "support"
              ? "Support reply"
              : "New message",
        body: `${shareLabel}${message.senderName}: ${message.body.slice(0, 80)}`,
        type: notifType,
        data: { conversationId: conv.id, messageId: message.id, shareKind: message.shareKind },
        actionUrl: messagesHref(uid, conv.id),
      }),
    ),
  );

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.MESSAGE_SENT,
    entityType: "message",
    entityId: message.id,
    metadata: {
      conversationId: conv.id,
      moderated: message.moderated,
      shareKind: message.shareKind,
    },
  });

  return getMessage(message.id)!;
}

export function getMessage(id: string): Message | null {
  const m = readCommunicationDb().messages.find((x) => x.id === id);
  return m ? normalizeMessage(m) : null;
}

export function markConversationRead(user: UserProfile, conversationId: string) {
  assertParticipant(user, conversationId);
  const stamp = nowIso();
  writeCommunicationDb((db) => {
    const c = db.conversations.find((x) => x.id === conversationId);
    if (!c) return;
    const p = c.participants.find((x) => x.userId === user.id);
    if (p) p.lastReadAt = stamp;
    for (const m of db.messages) {
      if (
        m.conversationId === conversationId &&
        m.senderId !== user.id &&
        m.deliveryStatus !== "read"
      ) {
        m.deliveryStatus = "read";
        m.updatedAt = stamp;
      }
    }
  });
}

export function setConversationFlags(
  user: UserProfile,
  conversationId: string,
  flags: { muted?: boolean; archived?: boolean; delete?: boolean },
) {
  assertParticipant(user, conversationId);
  writeCommunicationDb((db) => {
    const c = db.conversations.find((x) => x.id === conversationId);
    if (!c) return;
    const p = c.participants.find((x) => x.userId === user.id);
    if (!p) return;
    if (flags.muted !== undefined) p.muted = flags.muted;
    if (flags.archived !== undefined) p.archived = flags.archived;
    if (flags.delete) {
      if (c.kind === "support") {
        // Never destroy support history — archive only
        p.archived = true;
      } else if (c.createdById === user.id || c.kind === "direct") {
        c.deletedAt = nowIso();
      } else {
        p.archived = true;
      }
    }
    c.updatedAt = nowIso();
  });
}

export function deleteOwnMessage(user: UserProfile, messageId: string): Message {
  const message = getMessage(messageId);
  if (!message) throw new CommunicationError("Message not found", 404);
  assertParticipant(user, message.conversationId);
  if (message.senderId !== user.id && user.role !== ROLES.SUPER_ADMIN) {
    throw new CommunicationError("You can only delete your own messages", 403);
  }
  const age = Date.now() - Date.parse(message.createdAt);
  if (age > MESSAGE_DELETE_WINDOW_MS && user.role !== ROLES.SUPER_ADMIN) {
    throw new CommunicationError("Delete window expired", 403);
  }
  writeCommunicationDb((db) => {
    const m = db.messages.find((x) => x.id === messageId);
    if (m) {
      m.deletedAt = nowIso();
      m.body = "[message deleted]";
      m.updatedAt = nowIso();
    }
  });
  return getMessage(messageId)!;
}

export function reactToMessage(
  user: UserProfile,
  messageId: string,
  emoji: MessageReactionEmoji,
): Message {
  const message = getMessage(messageId);
  if (!message) throw new CommunicationError("Message not found", 404);
  assertParticipant(user, message.conversationId);
  writeCommunicationDb((db) => {
    const m = db.messages.find((x) => x.id === messageId);
    if (!m) return;
    m.reactions = m.reactions ?? [];
    const existing = m.reactions.findIndex((r) => r.userId === user.id && r.emoji === emoji);
    if (existing >= 0) {
      m.reactions.splice(existing, 1);
    } else {
      m.reactions.push({
        emoji,
        userId: user.id,
        userName: user.fullName || user.email,
        createdAt: nowIso(),
      });
    }
    m.updatedAt = nowIso();
  });
  return getMessage(messageId)!;
}

export function pinMessage(user: UserProfile, messageId: string, pinned: boolean): Message {
  const message = getMessage(messageId);
  if (!message) throw new CommunicationError("Message not found", 404);
  assertParticipant(user, message.conversationId);
  if (!isStaffRole(user.role) && user.role !== ROLES.STUDENT) {
    // students can pin in their threads too for personal focus
  }
  writeCommunicationDb((db) => {
    const m = db.messages.find((x) => x.id === messageId);
    if (m) {
      m.pinned = pinned;
      m.updatedAt = nowIso();
    }
  });
  return getMessage(messageId)!;
}

export function setTyping(user: UserProfile, conversationId: string): TypingState {
  assertParticipant(user, conversationId);
  heartbeatPresence(user.id);
  const state: TypingState = {
    conversationId,
    userId: user.id,
    userName: user.fullName || user.email,
    expiresAt: new Date(Date.now() + TYPING_TTL_MS).toISOString(),
  };
  writeCommunicationDb((db) => {
    db.typing = db.typing.filter(
      (t) =>
        !(t.conversationId === conversationId && t.userId === user.id) && t.expiresAt > nowIso(),
    );
    db.typing.push(state);
  });
  return state;
}

export function listTyping(conversationId: string, excludeUserId?: string): TypingState[] {
  const now = nowIso();
  return readCommunicationDb().typing.filter(
    (t) => t.conversationId === conversationId && t.expiresAt > now && t.userId !== excludeUserId,
  );
}

export function heartbeatPresence(userId: string): PresenceState {
  const stamp = nowIso();
  const state: PresenceState = { userId, status: "online", lastSeenAt: stamp };
  writeCommunicationDb((db) => {
    db.presence = db.presence.filter((p) => p.userId !== userId);
    db.presence.push(state);
  });
  return state;
}

export function listPresence(userIds: string[]): PresenceState[] {
  const cutoff = Date.now() - PRESENCE_TTL_MS;
  const map = new Map(readCommunicationDb().presence.map((p) => [p.userId, p] as const));
  return userIds.map((id) => {
    const row = map.get(id);
    if (row && Date.parse(row.lastSeenAt) >= cutoff) {
      return { userId: id, status: "online" as const, lastSeenAt: row.lastSeenAt };
    }
    return {
      userId: id,
      status: "offline" as const,
      lastSeenAt: row?.lastSeenAt ?? new Date(0).toISOString(),
    };
  });
}

export function conversationUnreadCount(user: UserProfile, conversationId: string): number {
  const conv = getConversation(conversationId);
  if (!conv) return 0;
  const p = conv.participants.find((x) => x.userId === user.id);
  const since = p?.lastReadAt ?? "1970-01-01";
  return readCommunicationDb().messages.filter(
    (m) =>
      m.conversationId === conversationId &&
      !m.deletedAt &&
      m.senderId !== user.id &&
      m.createdAt > since,
  ).length;
}

export function totalUnreadMessages(user: UserProfile): number {
  return listConversationsForUser(user).reduce(
    (sum, c) => sum + conversationUnreadCount(user, c.id),
    0,
  );
}

/** Forward a message into a new/existing direct conversation with a peer. */
export async function forwardMessage(input: {
  user: UserProfile;
  messageId: string;
  peerUserId: string;
}): Promise<{ conversation: Conversation; message: Message }> {
  const source = getMessage(input.messageId);
  if (!source || source.deletedAt) throw new CommunicationError("Message not found", 404);
  assertParticipant(input.user, source.conversationId);

  const conversation = await startDirectConversation({
    user: input.user,
    peerUserId: input.peerUserId,
  });

  const message = await sendMessage({
    user: input.user,
    conversationId: conversation.id,
    body: `Forwarded from ${source.senderName}:\n${source.body}`,
    attachments: source.attachments,
    shareKind: source.shareKind === "system" ? "text" : source.shareKind,
  });

  return { conversation, message };
}
