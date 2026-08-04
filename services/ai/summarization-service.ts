/**
 * Content summarization service.
 */

import { generateId } from "@/lib/security/crypto";
import { assertAiAccess, assertRateLimit, AiError } from "@/services/ai/access";
import { ensureAiSeeded } from "@/services/ai/seed";
import { writeAiDb } from "@/services/ai/store";
import { resolvePersona } from "@/services/ai/access";
import { estimateTokens } from "@/services/ai/provider";
import { readCoursesDb } from "@/services/courses/store";
import { readCommunicationDb } from "@/services/communication/store";
import { readLearningDb } from "@/services/learning/store";
import type { AiContentKind } from "@/types/ai";
import type { UserProfile } from "@/types";

export function summarizeContent(input: {
  user: UserProfile;
  kind: AiContentKind;
  targetId?: string | null;
  text?: string | null;
}): { summary: string; bullets: string[]; sourceTitle: string } {
  ensureAiSeeded();
  assertAiAccess(input.user);
  assertRateLimit(input.user.id);

  let sourceTitle = "Content";
  let body = (input.text ?? "").trim();

  if (input.kind === "lesson" && input.targetId) {
    const lesson = readCoursesDb().lessons.find((l) => l.id === input.targetId);
    if (!lesson) throw new AiError("Lesson not found", 404);
    sourceTitle = lesson.title;
    body = [lesson.title, lesson.description ?? "", lesson.contentHtml ?? ""]
      .filter(Boolean)
      .join("\n");
  } else if (input.kind === "module" && input.targetId) {
    const courseModule = readCoursesDb().modules.find((m) => m.id === input.targetId);
    if (!courseModule) throw new AiError("Module not found", 404);
    sourceTitle = courseModule.title;
    const lessons = readCoursesDb().lessons.filter((l) => l.moduleId === courseModule.id);
    body = [courseModule.title, courseModule.description ?? "", ...lessons.map((l) => l.title)].join(
      "\n",
    );
  } else if (input.kind === "course" && input.targetId) {
    const course = readCoursesDb().courses.find((c) => c.id === input.targetId);
    if (!course) throw new AiError("Course not found", 404);
    sourceTitle = course.title;
    body = [course.title, course.shortDescription ?? "", course.fullDescription ?? ""].join("\n");
  } else if (input.kind === "announcement" && input.targetId) {
    const row = readCommunicationDb().announcements.find((a) => a.id === input.targetId);
    if (!row) throw new AiError("Announcement not found", 404);
    sourceTitle = row.title;
    body = `${row.title}\n${row.bodyHtml ?? ""}`;
  } else if (input.kind === "blog" && input.targetId) {
    const row = readCommunicationDb().blogPosts.find((a) => a.id === input.targetId);
    if (!row) throw new AiError("Blog post not found", 404);
    sourceTitle = row.title;
    body = `${row.title}\n${row.excerpt ?? ""}\n${row.bodyHtml ?? ""}`;
  } else if (input.kind === "notes" && input.targetId) {
    const note = readLearningDb().notes.find(
      (n) => n.id === input.targetId && n.studentId === input.user.id,
    );
    if (!note) throw new AiError("Note not found", 404);
    sourceTitle = note.title || "Study note";
    body = `${note.title}\n${note.body ?? ""}`;
  } else if (input.kind === "pdf" || input.kind === "generic") {
    if (!body) throw new AiError("Text required for summarization", 400);
    sourceTitle = input.kind === "pdf" ? "Document" : "Content";
  }

  if (!body.trim()) throw new AiError("Nothing to summarize", 400);

  const sentences = body
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 6);

  const bullets =
    sentences.length > 0
      ? sentences.slice(0, 4).map((s) => s.slice(0, 160))
      : [
          `${sourceTitle} covers core syllabus outcomes.`,
          "Review definitions, then apply to a scenario.",
          "Finish with a short self-check quiz.",
        ];

  const summary = [
    `Summary of **${sourceTitle}**`,
    ``,
    bullets.map((b) => `• ${b}`).join("\n"),
    ``,
    `Generated from available platform content only — ask your instructor for clarifications.`,
  ].join("\n");

  writeAiDb((db) => {
    db.usage.push({
      id: generateId(),
      userId: input.user.id,
      persona: resolvePersona(input.user),
      action: "summarize",
      tokensIn: estimateTokens(body),
      tokensOut: estimateTokens(summary),
      conversationId: null,
      createdAt: new Date().toISOString(),
    });
  });

  return { summary, bullets, sourceTitle };
}
