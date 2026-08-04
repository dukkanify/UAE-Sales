/**
 * AI service facade — SOLID entry for chat + tools.
 */

import { isFeatureEnabled } from "@/services/settings/settings-service";
import { AiError, resolvePersona } from "@/services/ai/access";
import { suggestedPromptsFor } from "@/services/ai/prompt-service";
import { buildUserContext } from "@/services/ai/context-service";
import { ensureAiSeeded } from "@/services/ai/seed";
import type { UserProfile } from "@/types";

export function getAssistantBootstrap(user: UserProfile) {
  ensureAiSeeded();
  if (!isFeatureEnabled("ai")) {
    throw new AiError("AI assistant is disabled by feature flag", 403);
  }
  const persona = resolvePersona(user);
  return {
    persona,
    featureEnabled: true,
    suggestions: suggestedPromptsFor(persona),
    context: buildUserContext(user),
  };
}

export * from "@/services/ai/conversation-service";
export * from "@/services/ai/recommendation-service";
export * from "@/services/ai/summarization-service";
export * from "@/services/ai/question-service";
export * from "@/services/ai/study-planner-service";
export * from "@/services/ai/writing-service";
export * from "@/services/ai/search-service";
export * from "@/services/ai/insights-service";
export * from "@/services/ai/prompt-service";
export * from "@/services/ai/access";
export * from "@/services/ai/seed";
