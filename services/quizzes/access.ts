/**
 * Assessment access guards — manage vs student take.
 */

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { QuizValidationError } from "@/services/quizzes/validation";
import { readQuizzesDb } from "@/services/quizzes/store";
import type { Quiz } from "@/types/quizzes";
import type { UserProfile } from "@/types";

export class QuizAccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "QuizAccessError";
    this.status = status;
  }
}

export function canManageQuizzes(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.QUIZZES_MANAGE);
}

export function assertCanManageQuizzes(user: UserProfile) {
  if (!canManageQuizzes(user)) {
    throw new QuizAccessError("Quiz management permission required");
  }
}

export function getQuizOrThrow(quizId: string, opts?: { includeDeleted?: boolean }): Quiz {
  const quiz = readQuizzesDb().quizzes.find((q) => q.id === quizId);
  if (!quiz || (!opts?.includeDeleted && quiz.deletedAt)) {
    throw new QuizAccessError("Quiz not found", 404);
  }
  return quiz;
}

export function assertStudentCanAccessQuiz(user: UserProfile, quiz: Quiz) {
  if (user.role !== ROLES.STUDENT && !canManageQuizzes(user)) {
    throw new QuizAccessError("Not allowed to take this quiz");
  }
  if (quiz.status !== "published") {
    if (!canManageQuizzes(user)) {
      throw new QuizAccessError("Quiz is not available");
    }
  }
  if (quiz.deletedAt) throw new QuizAccessError("Quiz not found", 404);

  const now = Date.now();
  if (quiz.availableFrom && Date.parse(quiz.availableFrom) > now) {
    throw new QuizAccessError("Quiz is not yet available");
  }
  if (quiz.availableUntil && Date.parse(quiz.availableUntil) < now) {
    throw new QuizAccessError("Quiz availability has expired");
  }

  if (user.role === ROLES.STUDENT && quiz.courseId) {
    const enrolled = listStudentEnrollments(user.id).some(
      (e) =>
        e.courseId === quiz.courseId &&
        ["approved", "completed", "pending"].includes(e.status),
    );
    if (!enrolled) {
      throw new QuizAccessError("You must be enrolled in the linked course");
    }
  }
}

export function assertAttemptOwner(user: UserProfile, attemptStudentId: string) {
  if (user.id === attemptStudentId) return;
  if (canManageQuizzes(user)) return;
  throw new QuizAccessError("Attempt access denied");
}

export function parseJsonBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new QuizValidationError("JSON body required");
  }
  return body as Record<string, unknown>;
}
