/**
 * Private student notes.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { assertStudentEnrolled, LearningAccessError } from "@/services/learning/access";
import { recordHistory } from "@/services/learning/history-service";
import { readLearningDb, writeLearningDb } from "@/services/learning/store";
import type { StudentNote } from "@/types/learning";
import type { UserProfile } from "@/types";

export function listNotes(
  studentId: string,
  options?: { courseId?: string; q?: string },
): StudentNote[] {
  let rows = readLearningDb().notes.filter((n) => n.studentId === studentId);
  if (options?.courseId) rows = rows.filter((n) => n.courseId === options.courseId);
  if (options?.q) {
    const q = options.q.toLowerCase();
    rows = rows.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    );
  }
  return [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createNote(input: {
  user: UserProfile;
  courseId: string;
  lessonId?: string | null;
  title: string;
  body: string;
}): Promise<StudentNote> {
  assertStudentEnrolled(input.user, input.courseId);
  if (!input.title.trim()) throw new LearningAccessError("Note title is required", 400);
  const now = new Date().toISOString();
  const note: StudentNote = {
    id: generateId(),
    studentId: input.user.id,
    courseId: input.courseId,
    lessonId: input.lessonId ?? null,
    title: input.title.trim(),
    body: input.body ?? "",
    createdAt: now,
    updatedAt: now,
  };
  writeLearningDb((d) => {
    d.notes.unshift(note);
  });
  await recordHistory({
    studentId: input.user.id,
    type: "note_created",
    title: `Note: ${note.title}`,
    courseId: input.courseId,
    lessonId: input.lessonId,
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.NOTE_CREATED,
    entityType: "note",
    entityId: note.id,
  });
  return note;
}

export async function updateNote(input: {
  user: UserProfile;
  id: string;
  title?: string;
  body?: string;
}): Promise<StudentNote> {
  const existing = readLearningDb().notes.find(
    (n) => n.id === input.id && n.studentId === input.user.id,
  );
  if (!existing) throw new LearningAccessError("Note not found", 404);
  const next: StudentNote = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    body: input.body !== undefined ? input.body : existing.body,
    updatedAt: new Date().toISOString(),
  };
  if (!next.title) throw new LearningAccessError("Note title is required", 400);
  writeLearningDb((d) => {
    const idx = d.notes.findIndex((n) => n.id === input.id);
    if (idx >= 0) d.notes[idx] = next;
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.NOTE_UPDATED,
    entityType: "note",
    entityId: next.id,
  });
  return next;
}

export async function deleteNote(user: UserProfile, id: string): Promise<void> {
  const existing = readLearningDb().notes.find(
    (n) => n.id === id && n.studentId === user.id,
  );
  if (!existing) throw new LearningAccessError("Note not found", 404);
  writeLearningDb((d) => {
    d.notes = d.notes.filter((n) => n.id !== id);
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.NOTE_DELETED,
    entityType: "note",
    entityId: id,
  });
}

export function exportNotesMarkdown(studentId: string, courseId?: string): string {
  const notes = listNotes(studentId, { courseId });
  return notes
    .map(
      (n) =>
        `# ${n.title}\n\n_Updated ${n.updatedAt}_\n\n${n.body}\n\n---\n`,
    )
    .join("\n");
}
