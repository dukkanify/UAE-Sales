/**
 * AI writing assistant for instructors/admins.
 */

import { generateId } from "@/lib/security/crypto";
import {
  assertAiAccess,
  assertRateLimit,
  canUseInstructorTools,
  AiError,
  resolvePersona,
} from "@/services/ai/access";
import { estimateTokens, generateAssistantReply } from "@/services/ai/provider";
import { buildUserContext } from "@/services/ai/context-service";
import { ensureAiSeeded } from "@/services/ai/seed";
import { writeAiDb } from "@/services/ai/store";
import type { AiIntent } from "@/types/ai";
import type { UserProfile } from "@/types";

export type WritingKind =
  | "course_description"
  | "lesson_content"
  | "email"
  | "announcement"
  | "blog"
  | "faq"
  | "support"
  | "study_guide"
  | "discussion";

const KIND_INTENT: Record<WritingKind, AiIntent> = {
  course_description: "writing",
  lesson_content: "writing",
  email: "email",
  announcement: "announcement",
  blog: "writing",
  faq: "writing",
  support: "writing",
  study_guide: "writing",
  discussion: "writing",
};

export function generateWriting(input: {
  user: UserProfile;
  kind: WritingKind;
  topic: string;
  tone?: string;
}): { kind: WritingKind; title: string; body: string } {
  ensureAiSeeded();
  assertAiAccess(input.user);
  assertRateLimit(input.user.id);
  if (!canUseInstructorTools(input.user) && input.user.role === "student") {
    throw new AiError("Writing assistant is for instructors and admins", 403);
  }

  const context = buildUserContext(input.user);
  const intent = KIND_INTENT[input.kind];
  const prompt = `Write a ${input.kind.replace(/_/g, " ")} about: ${input.topic}. Tone: ${input.tone ?? "professional aviation education"}.`;
  const body = generateAssistantReply({
    message: prompt,
    persona: resolvePersona(input.user),
    intent,
    context,
  });

  writeAiDb((db) => {
    db.usage.push({
      id: generateId(),
      userId: input.user.id,
      persona: resolvePersona(input.user),
      action: "writing",
      tokensIn: estimateTokens(prompt),
      tokensOut: estimateTokens(body),
      conversationId: null,
      createdAt: new Date().toISOString(),
    });
  });

  return {
    kind: input.kind,
    title: `${input.kind.replace(/_/g, " ")} draft`,
    body,
  };
}
