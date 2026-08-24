/**
 * Private + group messaging service.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { TYPING_TTL_MS } from "@/constants/communication";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import {
  assertCanMessage,
  assertCanMessagePeer,
  CommunicationError,
} from "@/services/communication/access";
import { moderateText } from "@/services/communication/moderation-service";
import { notifyUsers } from "@/services/communication/notify";
import {
  readCommunicationDb,
  writeCommunicationDb,
} from "@/services/communication/store";
import type {
  AttachmentRef,
  Conversation,
  ConversationKind,
  Message,
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

export function listConversationsForUser(user: UserProfile): Conversation[] {
  assertCanMessage(user);
  return readCommunicationDb()
    .conversations.filter(
      (c) =>
        !c.deletedAt &&
        c.participantIds.includes(user.id) &&
        !c.participants.find((p) => p.userId === user.id)?.archived,
    )
    .sort((a, b) => (b.lastMessageAt ?? b.updatedAt).localeCompare(a.lastMessageAt ?? a.updatedAt));
}

export function getConversation(id: string): Conversation | null {
  return readCommunicationDb().conversations.find((c) => c.id === id && !c.deletedAt) ?? null;
}

export function assertParticipant(user: UserProfile, conversationId: string): Conversation {
  const conv = getConversation(conversationId);
  if (!conv) throw new CommunicationError("Conversation not found", 404);
  if (!conv.participantIds.includes(user.id)) {
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

export async function createGroupConversation(input: {
  user: UserProfile;
  kind: Exclude<ConversationKind, "direct">;
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

  await notifyUsers(
    ids.filter((id) => id !== input.user.id),
    {
      title: "Added to group conversation",
      body: `You were added to “${conv.title}”.`,
      type: "message.group_added",
      data: { conversationId: conv.id },
    },
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
  let rows = readCommunicationDb().messages.filter(
    (m) => m.conversationId === conversationId && !m.deletedAt,
  );
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
}): Promise<Message> {
  const conv = assertParticipant(input.user, input.conversationId);
  const participant = conv.participants.find((p) => p.userId === input.user.id);
  if (participant?.muted) {
    // muted means no notifications for others? Usually mute = don't notify me. Sending still allowed.
  }

  const body = input.body.trim();
  if (!body && !(input.attachments?.length)) {
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
    throw new CommunicationError("Message blocked by content moderation", 422);
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
    // Mark delivered for others
    message.deliveryStatus = "delivered";
    const stored = db.messages.find((m) => m.id === id);
    if (stored) stored.deliveryStatus = "delivered";
  });

  const recipients = conv.participantIds.filter((id) => {
    if (id === input.user.id) return false;
    const p = conv.participants.find((x) => x.userId === id);
    return !p?.muted;
  });

  await notifyUsers(recipients, {
    title: "New message",
    body: `${message.senderName}: ${message.body.slice(0, 80)}`,
    type: "message.new",
    data: { conversationId: conv.id, messageId: message.id },
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.MESSAGE_SENT,
    entityType: "message",
    entityId: message.id,
    metadata: { conversationId: conv.id, moderated: message.moderated },
  });

  return getMessage(message.id)!;
}

export function getMessage(id: string): Message | null {
  return readCommunicationDb().messages.find((m) => m.id === id) ?? null;
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
      if (m.conversationId === conversationId && m.senderId !== user.id && m.deliveryStatus !== "read") {
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
      // Soft-delete for user via archive; owners can hard soft-delete thread
      if (c.createdById === user.id || c.kind === "direct") {
        c.deletedAt = nowIso();
      } else {
        p.archived = true;
      }
    }
    c.updatedAt = nowIso();
  });
}

export function setTyping(user: UserProfile, conversationId: string): TypingState {
  assertParticipant(user, conversationId);
  const state: TypingState = {
    conversationId,
    userId: user.id,
    userName: user.fullName || user.email,
    expiresAt: new Date(Date.now() + TYPING_TTL_MS).toISOString(),
  };
  writeCommunicationDb((db) => {
    db.typing = db.typing.filter(
      (t) => !(t.conversationId === conversationId && t.userId === user.id) && t.expiresAt > nowIso(),
    );
    db.typing.push(state);
  });
  return state;
}

export function listTyping(conversationId: string, excludeUserId?: string): TypingState[] {
  const now = nowIso();
  return readCommunicationDb().typing.filter(
    (t) =>
      t.conversationId === conversationId &&
      t.expiresAt > now &&
      t.userId !== excludeUserId,
  );
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
