/**
 * Quiz lifecycle service (CRUD, publish, archive, duplicate, question links).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { DEFAULT_QUIZ_PAGE_SIZE } from "@/constants/quizzes";
import { logActivity } from "@/services/auth/activity-log";
import { getCourseById } from "@/services/courses/course-service";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { assertCanManageQuizzes, getQuizOrThrow } from "@/services/quizzes/access";
import { getQuestionById } from "@/services/quizzes/question-bank-service";
import { QuizValidationError, requireNonEmpty } from "@/services/quizzes/validation";
import { readQuizzesDb, writeQuizzesDb } from "@/services/quizzes/store";
import type {
  Quiz,
  QuizFilters,
  QuizListItem,
  QuizQuestionLink,
  QuizStatus,
} from "@/types/quizzes";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function toListItem(quiz: Quiz): QuizListItem {
  const db = readQuizzesDb();
  const courseTitle = quiz.courseId ? getCourseById(quiz.courseId)?.title ?? null : null;
  return {
    ...quiz,
    courseTitle,
    questionLinks: db.quizQuestions.filter((l) => l.quizId === quiz.id).length,
    attemptsCount: db.attempts.filter((a) => a.quizId === quiz.id).length,
  };
}

export function listQuizzes(filters: QuizFilters = {}): {
  data: QuizListItem[];
  total: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? DEFAULT_QUIZ_PAGE_SIZE));
  let rows = readQuizzesDb().quizzes.filter((q) => !q.deletedAt);
  if (filters.status && filters.status !== "all") {
    rows = rows.filter((q) => q.status === filters.status);
  }
  if (filters.courseId) rows = rows.filter((q) => q.courseId === filters.courseId);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q),
    );
  }
  rows = [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize).map(toListItem),
    total,
    page,
    pageSize,
  };
}

export function getQuizDetail(quizId: string) {
  const quiz = getQuizOrThrow(quizId);
  const links = readQuizzesDb()
    .quizQuestions.filter((l) => l.quizId === quizId)
    .sort((a, b) => a.order - b.order);
  const questions = links
    .map((l) => {
      const q = getQuestionById(l.questionId);
      return q ? { link: l, question: q } : null;
    })
    .filter(Boolean) as Array<{ link: QuizQuestionLink; question: NonNullable<ReturnType<typeof getQuestionById>> }>;
  return { quiz: toListItem(quiz), questions };
}

export async function createQuiz(input: {
  user: UserProfile;
  title: string;
  description?: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  passingScore?: number;
  totalMarks?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number;
  instructions?: string;
}): Promise<Quiz> {
  assertCanManageQuizzes(input.user);
  const title = requireNonEmpty(input.title, "Quiz title");
  const stamp = nowIso();
  const quiz: Quiz = {
    id: generateId(),
    title,
    description: input.description ?? "",
    courseId: input.courseId ?? null,
    moduleId: input.moduleId ?? null,
    lessonId: input.lessonId ?? null,
    status: "draft",
    passingScore: input.passingScore ?? 70,
    totalMarks: input.totalMarks ?? 0,
    timeLimitMinutes: input.timeLimitMinutes ?? 60,
    maxAttempts: input.maxAttempts ?? 2,
    randomQuestions: false,
    randomAnswers: false,
    negativeMarking: false,
    negativeMarkValue: 0.25,
    showResultsImmediately: true,
    reviewAnswers: true,
    availableFrom: null,
    availableUntil: null,
    autoSubmitOnExpiry: true,
    allowResume: true,
    preventDuplicateAttempts: true,
    questionCount: null,
    instructions: input.instructions ?? "",
    createdById: input.user.id,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
    archivedAt: null,
    publishedAt: null,
  };
  writeQuizzesDb((d) => {
    d.quizzes.unshift(quiz);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.QUIZ_CREATED,
    entityType: "quiz",
    entityId: quiz.id,
  });
  return quiz;
}

export async function updateQuiz(input: {
  user: UserProfile;
  id: string;
  patch: Partial<
    Omit<Quiz, "id" | "createdAt" | "createdById" | "deletedAt" | "archivedAt" | "publishedAt">
  >;
}): Promise<Quiz> {
  assertCanManageQuizzes(input.user);
  const existing = getQuizOrThrow(input.id);
  const next: Quiz = {
    ...existing,
    ...input.patch,
    updatedAt: nowIso(),
  };
  writeQuizzesDb((d) => {
    const idx = d.quizzes.findIndex((q) => q.id === input.id);
    if (idx >= 0) d.quizzes[idx] = next;
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.QUIZ_UPDATED,
    entityType: "quiz",
    entityId: next.id,
  });
  return next;
}

async function setStatus(
  user: UserProfile,
  id: string,
  status: QuizStatus,
  action: string,
): Promise<Quiz> {
  assertCanManageQuizzes(user);
  const existing = getQuizOrThrow(id);
  const stamp = nowIso();
  const next: Quiz = {
    ...existing,
    status,
    updatedAt: stamp,
    publishedAt: status === "published" ? stamp : existing.publishedAt,
    archivedAt: status === "archived" ? stamp : existing.archivedAt,
  };
  writeQuizzesDb((d) => {
    const idx = d.quizzes.findIndex((q) => q.id === id);
    if (idx >= 0) d.quizzes[idx] = next;
  });
  await logActivity({
    actorId: user.id,
    action,
    entityType: "quiz",
    entityId: id,
  });
  return next;
}

export async function publishQuiz(user: UserProfile, id: string) {
  return setStatus(user, id, "published", ACTIVITY_ACTIONS.QUIZ_PUBLISHED);
}

export async function unpublishQuiz(user: UserProfile, id: string) {
  return setStatus(user, id, "draft", ACTIVITY_ACTIONS.QUIZ_UNPUBLISHED);
}

export async function archiveQuiz(user: UserProfile, id: string) {
  return setStatus(user, id, "archived", ACTIVITY_ACTIONS.QUIZ_ARCHIVED);
}

export async function softDeleteQuiz(user: UserProfile, id: string) {
  assertCanManageQuizzes(user);
  const existing = getQuizOrThrow(id);
  writeQuizzesDb((d) => {
    const idx = d.quizzes.findIndex((q) => q.id === id);
    if (idx >= 0) {
      d.quizzes[idx] = {
        ...existing,
        deletedAt: nowIso(),
        status: "archived",
        archivedAt: nowIso(),
        updatedAt: nowIso(),
      };
    }
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.QUIZ_DELETED,
    entityType: "quiz",
    entityId: id,
  });
}

export async function duplicateQuiz(user: UserProfile, id: string): Promise<Quiz> {
  assertCanManageQuizzes(user);
  const detail = getQuizDetail(id);
  const stamp = nowIso();
  const copy: Quiz = {
    ...detail.quiz,
    id: generateId(),
    title: `${detail.quiz.title} (Copy)`,
    status: "draft",
    createdById: user.id,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
    archivedAt: null,
    publishedAt: null,
  };
  writeQuizzesDb((d) => {
    d.quizzes.unshift(copy);
    for (const { link } of detail.questions) {
      d.quizQuestions.push({
        id: generateId(),
        quizId: copy.id,
        questionId: link.questionId,
        order: link.order,
        pointsOverride: link.pointsOverride,
      });
    }
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.QUIZ_DUPLICATED,
    entityType: "quiz",
    entityId: copy.id,
    metadata: { from: id },
  });
  return copy;
}

export async function setQuizQuestions(input: {
  user: UserProfile;
  quizId: string;
  questionIds: string[];
}): Promise<QuizQuestionLink[]> {
  assertCanManageQuizzes(input.user);
  getQuizOrThrow(input.quizId);
  for (const qid of input.questionIds) {
    if (!getQuestionById(qid)) {
      throw new QuizValidationError(`Question not found: ${qid}`, 404);
    }
  }
  const links: QuizQuestionLink[] = input.questionIds.map((questionId, index) => ({
    id: generateId(),
    quizId: input.quizId,
    questionId,
    order: index + 1,
    pointsOverride: null,
  }));
  writeQuizzesDb((d) => {
    d.quizQuestions = d.quizQuestions.filter((l) => l.quizId !== input.quizId);
    d.quizQuestions.push(...links);
    const quizIdx = d.quizzes.findIndex((q) => q.id === input.quizId);
    if (quizIdx >= 0) {
      const marks = links.reduce((sum, l) => {
        const q = d.questions.find((qq) => qq.id === l.questionId);
        return sum + (l.pointsOverride ?? q?.points ?? 0);
      }, 0);
      d.quizzes[quizIdx] = {
        ...d.quizzes[quizIdx]!,
        totalMarks: marks,
        updatedAt: nowIso(),
      };
    }
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.QUIZ_UPDATED,
    entityType: "quiz",
    entityId: input.quizId,
    metadata: { questionCount: links.length },
  });
  return links;
}

export function listPublishedQuizzesForStudent(studentId: string): QuizListItem[] {
  const enrolled = new Set(
    listStudentEnrollments(studentId)
      .filter((e) => ["approved", "completed", "pending"].includes(e.status))
      .map((e) => e.courseId),
  );
  return listQuizzes({ status: "published", pageSize: 100 }).data.filter(
    (q) => !q.courseId || enrolled.has(q.courseId),
  );
}
