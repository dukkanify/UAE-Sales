/**
 * Central Question Bank service.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import {
  DEFAULT_QUESTION_PAGE_SIZE,
  QUESTION_TYPE_LABELS,
} from "@/constants/quizzes";
import { logActivity } from "@/services/auth/activity-log";
import { assertCanManageQuizzes } from "@/services/quizzes/access";
import {
  assertDifficulty,
  assertQuestionType,
  QuizValidationError,
  requireNonEmpty,
} from "@/services/quizzes/validation";
import { readQuizzesDb, writeQuizzesDb } from "@/services/quizzes/store";
import type {
  BankQuestion,
  QuestionBankCategory,
  QuestionFilters,
  QuestionOption,
} from "@/types/quizzes";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

export function listCategories(): QuestionBankCategory[] {
  return [...readQuizzesDb().categories].sort((a, b) => a.order - b.order);
}

export async function createCategory(input: {
  user: UserProfile;
  name: string;
  subject?: string;
  moduleLabel?: string;
  parentId?: string | null;
  description?: string;
}): Promise<QuestionBankCategory> {
  assertCanManageQuizzes(input.user);
  const name = requireNonEmpty(input.name, "Category name");
  const stamp = nowIso();
  const category: QuestionBankCategory = {
    id: generateId(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    subject: input.subject?.trim() || "General",
    moduleLabel: input.moduleLabel?.trim() || "",
    parentId: input.parentId ?? null,
    description: input.description ?? "",
    order: readQuizzesDb().categories.length + 1,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeQuizzesDb((d) => {
    d.categories.push(category);
  });
  return category;
}

export function listQuestions(filters: QuestionFilters = {}): {
  data: BankQuestion[];
  total: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? DEFAULT_QUESTION_PAGE_SIZE));
  let rows = readQuizzesDb().questions.filter((q) => !q.deletedAt);

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.stem.toLowerCase().includes(q) ||
        row.tags.some((t) => t.toLowerCase().includes(q)) ||
        row.subject.toLowerCase().includes(q) ||
        (row.externalId ?? "").toLowerCase().includes(q),
    );
  }
  if (filters.type && filters.type !== "all") {
    rows = rows.filter((r) => r.type === filters.type);
  }
  if (filters.difficulty && filters.difficulty !== "all") {
    rows = rows.filter((r) => r.difficulty === filters.difficulty);
  }
  if (filters.categoryId) {
    rows = rows.filter((r) => r.categoryId === filters.categoryId);
  }
  if (filters.subject) {
    rows = rows.filter((r) => r.subject.toLowerCase() === filters.subject!.toLowerCase());
  }
  if (filters.tag) {
    const tag = filters.tag.toLowerCase();
    rows = rows.filter((r) => r.tags.some((t) => t.toLowerCase() === tag));
  }

  rows = [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total, page, pageSize };
}

export function getQuestionById(id: string): BankQuestion | null {
  return readQuizzesDb().questions.find((q) => q.id === id && !q.deletedAt) ?? null;
}

export async function createQuestion(input: {
  user: UserProfile;
  stem: string;
  type: unknown;
  difficulty?: unknown;
  categoryId?: string | null;
  subject?: string;
  moduleLabel?: string;
  tags?: string[];
  options?: QuestionOption[];
  correctAnswer?: unknown;
  explanation?: string;
  points?: number;
  externalId?: string | null;
  externalSource?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<BankQuestion> {
  assertCanManageQuizzes(input.user);
  const type = assertQuestionType(input.type);
  const difficulty = input.difficulty
    ? assertDifficulty(input.difficulty)
    : "medium";
  const stem = requireNonEmpty(input.stem, "Question stem");
  const stamp = nowIso();
  const question: BankQuestion = {
    id: generateId(),
    stem,
    type,
    difficulty,
    categoryId: input.categoryId ?? null,
    subject: input.subject?.trim() || "General",
    moduleLabel: input.moduleLabel?.trim() || "",
    tags: input.tags ?? [],
    options: input.options ?? [],
    correctAnswer: input.correctAnswer ?? null,
    explanation: input.explanation ?? "",
    points: Math.max(1, input.points ?? 1),
    externalId: input.externalId ?? null,
    externalSource: input.externalSource ?? null,
    metadata: input.metadata ?? {},
    createdById: input.user.id,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
  };
  writeQuizzesDb((d) => {
    d.questions.unshift(question);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.QUESTION_CREATED,
    entityType: "question",
    entityId: question.id,
    metadata: { type: QUESTION_TYPE_LABELS[type] },
  });
  return question;
}

export async function updateQuestion(input: {
  user: UserProfile;
  id: string;
  patch: Partial<
    Pick<
      BankQuestion,
      | "stem"
      | "type"
      | "difficulty"
      | "categoryId"
      | "subject"
      | "moduleLabel"
      | "tags"
      | "options"
      | "correctAnswer"
      | "explanation"
      | "points"
      | "metadata"
    >
  >;
}): Promise<BankQuestion> {
  assertCanManageQuizzes(input.user);
  const existing = getQuestionById(input.id);
  if (!existing) throw new QuizValidationError("Question not found", 404);
  if (input.patch.type) assertQuestionType(input.patch.type);
  if (input.patch.difficulty) assertDifficulty(input.patch.difficulty);
  const next: BankQuestion = {
    ...existing,
    ...input.patch,
    updatedAt: nowIso(),
  };
  writeQuizzesDb((d) => {
    const idx = d.questions.findIndex((q) => q.id === input.id);
    if (idx >= 0) d.questions[idx] = next;
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.QUESTION_UPDATED,
    entityType: "question",
    entityId: next.id,
  });
  return next;
}

export async function deleteQuestion(user: UserProfile, id: string): Promise<void> {
  assertCanManageQuizzes(user);
  const existing = getQuestionById(id);
  if (!existing) throw new QuizValidationError("Question not found", 404);
  writeQuizzesDb((d) => {
    const idx = d.questions.findIndex((q) => q.id === id);
    if (idx >= 0) d.questions[idx] = { ...d.questions[idx]!, deletedAt: nowIso() };
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.QUESTION_DELETED,
    entityType: "question",
    entityId: id,
  });
}

export function exportQuestionsJson(filters: QuestionFilters = {}): BankQuestion[] {
  return listQuestions({ ...filters, page: 1, pageSize: 5000 }).data;
}
