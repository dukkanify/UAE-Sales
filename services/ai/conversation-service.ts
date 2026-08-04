/**
 * Conversation + chat orchestration.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  AiError,
  assertAiAccess,
  assertRateLimit,
  redactSensitive,
  resolvePersona,
  safetyCheck,
} from "@/services/ai/access";
import { buildUserContext } from "@/services/ai/context-service";
import {
  detectIntent,
  estimateTokens,
  generateAssistantReply,
  streamText,
} from "@/services/ai/provider";
import { ensurePromptTemplates } from "@/services/ai/prompt-service";
import { readAiDb, writeAiDb } from "@/services/ai/store";
import { ensureAiSeeded } from "@/services/ai/seed";
import type { AiConversation, AiMessage } from "@/types/ai";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

export function listConversations(user: UserProfile): AiConversation[] {
  ensureAiSeeded();
  assertAiAccess(user);
  return readAiDb()
    .conversations.filter((c) => c.userId === user.id && !c.archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getConversation(user: UserProfile, id: string) {
  assertAiAccess(user);
  const conversation = readAiDb().conversations.find(
    (c) => c.id === id && c.userId === user.id,
  );
  if (!conversation) throw new AiError("Conversation not found", 404);
  const messages = readAiDb()
    .messages.filter((m) => m.conversationId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { conversation, messages };
}

export async function createConversation(input: {
  user: UserProfile;
  title?: string;
  contextCourseId?: string | null;
  contextLessonId?: string | null;
}): Promise<AiConversation> {
  ensureAiSeeded();
  assertAiAccess(input.user);
  ensurePromptTemplates();
  const stamp = nowIso();
  const conversation: AiConversation = {
    id: generateId(),
    userId: input.user.id,
    persona: resolvePersona(input.user),
    title: input.title?.trim() || "New conversation",
    contextCourseId: input.contextCourseId ?? null,
    contextLessonId: input.contextLessonId ?? null,
    archived: false,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeAiDb((db) => {
    db.conversations.unshift(conversation);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.AI_CONVERSATION_CREATED,
    entityType: "ai_conversation",
    entityId: conversation.id,
  });
  return conversation;
}

export async function sendMessage(input: {
  user: UserProfile;
  conversationId?: string | null;
  message: string;
  contextCourseId?: string | null;
}): Promise<{ conversation: AiConversation; userMessage: AiMessage; assistantMessage: AiMessage }> {
  ensureAiSeeded();
  assertAiAccess(input.user);
  assertRateLimit(input.user.id);

  const safety = safetyCheck(input.message);
  const persona = resolvePersona(input.user);
  const preview = redactSensitive(input.message).slice(0, 240);

  if (!safety.ok) {
    writeAiDb((db) => {
      db.logs.unshift({
        id: generateId(),
        userId: input.user.id,
        persona,
        action: "chat_blocked",
        safe: false,
        blockedReason: safety.reason,
        inputPreview: preview,
        outputPreview: "",
        metadata: {},
        createdAt: nowIso(),
      });
    });
    await logActivity({
      actorId: input.user.id,
      action: ACTIVITY_ACTIONS.AI_BLOCKED,
      entityType: "ai_safety",
      entityId: null,
      metadata: { reason: safety.reason },
    });
    throw new AiError(safety.reason ?? "Blocked", 400);
  }

  let conversation =
    (input.conversationId
      ? readAiDb().conversations.find(
          (c) => c.id === input.conversationId && c.userId === input.user.id,
        )
      : null) ?? null;

  if (!conversation) {
    conversation = await createConversation({
      user: input.user,
      title: input.message.slice(0, 48),
      contextCourseId: input.contextCourseId,
    });
  }

  const intent = detectIntent(input.message, persona);
  const context = buildUserContext(input.user);
  const reply = generateAssistantReply({
    message: input.message,
    persona,
    intent,
    context,
  });

  const stamp = nowIso();
  const userMessage: AiMessage = {
    id: generateId(),
    conversationId: conversation.id,
    role: "user",
    content: redactSensitive(input.message.trim()),
    intent,
    metadata: {},
    createdAt: stamp,
  };
  const assistantMessage: AiMessage = {
    id: generateId(),
    conversationId: conversation.id,
    role: "assistant",
    content: reply,
    intent,
    metadata: { groundedCourses: context.enrolledCourses.map((c) => c.id) },
    createdAt: new Date(Date.now() + 1).toISOString(),
  };

  writeAiDb((db) => {
    db.messages.push(userMessage, assistantMessage);
    const row = db.conversations.find((c) => c.id === conversation!.id);
    if (row) {
      row.updatedAt = assistantMessage.createdAt;
      if (row.title === "New conversation") row.title = input.message.slice(0, 48);
    }
    db.usage.push({
      id: generateId(),
      userId: input.user.id,
      persona,
      action: "chat",
      tokensIn: estimateTokens(input.message),
      tokensOut: estimateTokens(reply),
      conversationId: conversation!.id,
      createdAt: stamp,
    });
    db.logs.unshift({
      id: generateId(),
      userId: input.user.id,
      persona,
      action: "chat",
      safe: true,
      blockedReason: null,
      inputPreview: preview,
      outputPreview: reply.slice(0, 240),
      metadata: { intent },
      createdAt: stamp,
    });
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.AI_CHAT,
    entityType: "ai_conversation",
    entityId: conversation.id,
    metadata: { intent },
  });

  return { conversation, userMessage, assistantMessage };
}

export async function* streamAssistantMessage(input: {
  user: UserProfile;
  conversationId?: string | null;
  message: string;
}): AsyncGenerator<{ type: "meta" | "token" | "done"; data: unknown }> {
  const result = await sendMessage(input);
  yield {
    type: "meta",
    data: {
      conversationId: result.conversation.id,
      userMessageId: result.userMessage.id,
      assistantMessageId: result.assistantMessage.id,
      intent: result.assistantMessage.intent,
    },
  };
  for await (const token of streamText(result.assistantMessage.content, 8)) {
    yield { type: "token", data: { token } };
  }
  yield { type: "done", data: { message: result.assistantMessage } };
}

export async function submitFeedback(input: {
  user: UserProfile;
  messageId: string;
  rating: "up" | "down";
  comment?: string;
}) {
  assertAiAccess(input.user);
  const message = readAiDb().messages.find((m) => m.id === input.messageId);
  if (!message) throw new AiError("Message not found", 404);
  const conversation = readAiDb().conversations.find(
    (c) => c.id === message.conversationId && c.userId === input.user.id,
  );
  if (!conversation) throw new AiError("Conversation not found", 404);

  const feedback = {
    id: generateId(),
    messageId: message.id,
    conversationId: conversation.id,
    userId: input.user.id,
    rating: input.rating,
    comment: (input.comment ?? "").slice(0, 500),
    createdAt: nowIso(),
  };
  writeAiDb((db) => {
    db.feedback.unshift(feedback);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.AI_FEEDBACK,
    entityType: "ai_feedback",
    entityId: feedback.id,
  });
  return feedback;
}

export function listAiLogs(limit = 100) {
  return [...readAiDb().logs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getUsageSummary(userId?: string) {
  const rows = readAiDb().usage.filter((u) => !userId || u.userId === userId);
  return {
    totalRequests: rows.length,
    tokensIn: rows.reduce((s, r) => s + r.tokensIn, 0),
    tokensOut: rows.reduce((s, r) => s + r.tokensOut, 0),
    byAction: Object.entries(
      rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.action] = (acc[r.action] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([action, count]) => ({ action, count })),
  };
}
