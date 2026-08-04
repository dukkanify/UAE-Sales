/**
 * Learning history / activity feed.
 */

import { generateId } from "@/lib/security/crypto";
import { writeLearningDb, readLearningDb } from "@/services/learning/store";
import type { LearningActivityType, LearningHistoryEvent } from "@/types/learning";

export async function recordHistory(input: {
  studentId: string;
  type: LearningActivityType;
  title: string;
  description?: string;
  courseId?: string | null;
  lessonId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<LearningHistoryEvent> {
  const event: LearningHistoryEvent = {
    id: generateId(),
    studentId: input.studentId,
    type: input.type,
    title: input.title,
    description: input.description ?? "",
    courseId: input.courseId ?? null,
    lessonId: input.lessonId ?? null,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  writeLearningDb((d) => {
    d.history.unshift(event);
    if (d.history.length > 2000) d.history = d.history.slice(0, 2000);
  });
  return event;
}

export function listHistory(
  studentId: string,
  options?: { limit?: number },
): LearningHistoryEvent[] {
  return readLearningDb()
    .history.filter((h) => h.studentId === studentId)
    .slice(0, options?.limit ?? 50);
}
