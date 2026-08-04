/**
 * AI question / flashcard generation.
 */

import { generateId } from "@/lib/security/crypto";
import { ROLES } from "@/constants/roles";
import {
  assertAiAccess,
  assertRateLimit,
  canUseInstructorTools,
  AiError,
  resolvePersona,
} from "@/services/ai/access";
import { buildUserContext } from "@/services/ai/context-service";
import { buildPracticeQuestions, estimateTokens } from "@/services/ai/provider";
import { ensureAiSeeded } from "@/services/ai/seed";
import { writeAiDb } from "@/services/ai/store";
import type { AiDifficulty, AiGeneratedQuestion } from "@/types/ai";
import type { UserProfile } from "@/types";

export function generateQuestions(input: {
  user: UserProfile;
  topic?: string;
  difficulty?: AiDifficulty;
  count?: number;
}): AiGeneratedQuestion[] {
  ensureAiSeeded();
  assertAiAccess(input.user);
  assertRateLimit(input.user.id);
  if (input.user.role === ROLES.INSTRUCTOR && !canUseInstructorTools(input.user)) {
    throw new AiError("Instructor AI tools required", 403);
  }

  const context = buildUserContext(input.user);
  const difficulty = input.difficulty ?? "medium";
  const topic = input.topic?.trim() || context.enrolledCourses[0]?.title || "ATPL fundamentals";
  const questions = buildPracticeQuestions(topic, difficulty, context);
  const count = Math.min(Math.max(input.count ?? 4, 1), 10);
  const out = questions.slice(0, count);

  writeAiDb((db) => {
    db.usage.push({
      id: generateId(),
      userId: input.user.id,
      persona: resolvePersona(input.user),
      action: "questions",
      tokensIn: estimateTokens(topic),
      tokensOut: estimateTokens(JSON.stringify(out)),
      conversationId: null,
      createdAt: new Date().toISOString(),
    });
  });

  return out;
}
