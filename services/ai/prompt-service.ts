/**
 * Prompt templates + suggested starters.
 */

import { generateId } from "@/lib/security/crypto";
import { readAiDb, writeAiDb } from "@/services/ai/store";
import type { AiAssistantPersona, AiIntent, AiPromptTemplate } from "@/types/ai";

const DEFAULT_PROMPTS: Array<Omit<AiPromptTemplate, "id">> = [
  {
    key: "student_explain",
    persona: "student",
    title: "Explain this lesson",
    prompt: "Explain the current lesson in simple terms using my enrolled courses.",
    intent: "explain",
    active: true,
  },
  {
    key: "student_summary",
    persona: "student",
    title: "Summarize chapter",
    prompt: "Summarize this chapter and list the key takeaways for exam prep.",
    intent: "summarize",
    active: true,
  },
  {
    key: "student_next",
    persona: "student",
    title: "What should I study next?",
    prompt: "Based on my progress and quiz performance, what should I study next?",
    intent: "recommend",
    active: true,
  },
  {
    key: "student_questions",
    persona: "student",
    title: "Practice questions",
    prompt: "Create medium difficulty practice questions for my active course.",
    intent: "practice_questions",
    active: true,
  },
  {
    key: "student_plan",
    persona: "student",
    title: "Weekly study plan",
    prompt: "Generate a weekly study plan for my enrolled courses.",
    intent: "study_plan",
    active: true,
  },
  {
    key: "instr_objectives",
    persona: "instructor",
    title: "Lesson objectives",
    prompt: "Generate clear lesson objectives for my next class.",
    intent: "lesson_objectives",
    active: true,
  },
  {
    key: "instr_quiz",
    persona: "instructor",
    title: "Generate quiz",
    prompt: "Generate a short quiz with MCQ and true/false items for my course.",
    intent: "practice_questions",
    active: true,
  },
  {
    key: "instr_announce",
    persona: "instructor",
    title: "Announcement draft",
    prompt: "Draft a professional announcement about upcoming live classes.",
    intent: "announcement",
    active: true,
  },
  {
    key: "instr_rewrite",
    persona: "instructor",
    title: "Improve description",
    prompt: "Rewrite this course description to be clearer and more professional.",
    intent: "writing",
    active: true,
  },
  {
    key: "admin_insights",
    persona: "admin",
    title: "Platform insights",
    prompt: "Summarize platform engagement and highlight students at risk.",
    intent: "insights",
    active: true,
  },
  {
    key: "admin_exec",
    persona: "admin",
    title: "Executive summary",
    prompt: "Generate an executive summary of learning and attendance trends.",
    intent: "report",
    active: true,
  },
  {
    key: "admin_campaign",
    persona: "admin",
    title: "Re-engagement message",
    prompt: "Draft a re-engagement notification for inactive students.",
    intent: "notification",
    active: true,
  },
];

export function ensurePromptTemplates() {
  const db = readAiDb();
  if (db.prompts.length) return;
  writeAiDb((d) => {
    d.prompts = DEFAULT_PROMPTS.map((p) => ({ ...p, id: generateId() }));
  });
}

export function listPromptTemplates(persona?: AiAssistantPersona): AiPromptTemplate[] {
  ensurePromptTemplates();
  return readAiDb()
    .prompts.filter((p) => p.active && (p.persona === "all" || !persona || p.persona === persona))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getPromptByKey(key: string): AiPromptTemplate | null {
  ensurePromptTemplates();
  return readAiDb().prompts.find((p) => p.key === key) ?? null;
}

export function suggestedPromptsFor(persona: AiAssistantPersona): Array<{ title: string; prompt: string; intent: AiIntent }> {
  return listPromptTemplates(persona).map((p) => ({
    title: p.title,
    prompt: p.prompt,
    intent: p.intent,
  }));
}
