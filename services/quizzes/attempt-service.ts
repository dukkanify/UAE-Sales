/**
 * Student quiz attempts — start, resume, auto-save, submit, security checks.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  assertAttemptOwner,
  assertCanManageQuizzes,
  assertStudentCanAccessQuiz,
  canManageQuizzes,
  getQuizOrThrow,
  QuizAccessError,
} from "@/services/quizzes/access";
import {
  applyNegativeMarking,
  autoGradeResponse,
  needsManualGrading,
} from "@/services/quizzes/grading-service";
import { getQuestionById } from "@/services/quizzes/question-bank-service";
import { getQuizDetail } from "@/services/quizzes/quiz-service";
import { readQuizzesDb, writeQuizzesDb } from "@/services/quizzes/store";
import type {
  QuizAnswer,
  QuizAttempt,
} from "@/types/quizzes";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function listAttemptsForStudent(studentId: string, quizId?: string): QuizAttempt[] {
  return readQuizzesDb()
    .attempts.filter(
      (a) => a.studentId === studentId && (!quizId || a.quizId === quizId),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function listAttemptsForQuiz(quizId: string): QuizAttempt[] {
  return readQuizzesDb()
    .attempts.filter((a) => a.quizId === quizId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getAttemptById(id: string): QuizAttempt | null {
  return readQuizzesDb().attempts.find((a) => a.id === id) ?? null;
}

export function getAnswersForAttempt(attemptId: string): QuizAnswer[] {
  return readQuizzesDb().answers.filter((a) => a.attemptId === attemptId);
}

function expireIfNeeded(attempt: QuizAttempt): QuizAttempt {
  if (attempt.status !== "in_progress" || !attempt.expiresAt) return attempt;
  if (Date.parse(attempt.expiresAt) > Date.now()) return attempt;
  const stamp = nowIso();
  writeQuizzesDb((d) => {
    const idx = d.attempts.findIndex((a) => a.id === attempt.id);
    if (idx >= 0) {
      d.attempts[idx] = {
        ...d.attempts[idx]!,
        status: "expired",
        submittedAt: stamp,
        updatedAt: stamp,
      };
    }
  });
  return getAttemptById(attempt.id)!;
}

export async function startAttempt(input: {
  user: UserProfile;
  quizId: string;
}): Promise<{ attempt: QuizAttempt; questions: ReturnType<typeof buildStudentQuestions> }> {
  const quiz = getQuizOrThrow(input.quizId);
  assertStudentCanAccessQuiz(input.user, quiz);

  const prior = listAttemptsForStudent(input.user.id, quiz.id);
  const active = prior.find((a) => a.status === "in_progress");
  if (active) {
    if (quiz.preventDuplicateAttempts) {
      const refreshed = expireIfNeeded(active);
      if (refreshed.status === "in_progress") {
        if (!quiz.allowResume) {
          throw new QuizAccessError("An active attempt already exists");
        }
        return {
          attempt: refreshed,
          questions: buildStudentQuestions(refreshed, quiz.randomAnswers, false),
        };
      }
    }
  }

  const completedCount = prior.filter((a) =>
    ["submitted", "graded", "expired"].includes(a.status),
  ).length;
  if (completedCount >= quiz.maxAttempts) {
    throw new QuizAccessError("Maximum attempts reached");
  }

  const detail = getQuizDetail(quiz.id);
  let questionIds = detail.questions.map((q) => q.question.id);
  if (quiz.randomQuestions) {
    questionIds = shuffle(questionIds);
    if (quiz.questionCount && quiz.questionCount > 0) {
      questionIds = questionIds.slice(0, quiz.questionCount);
    }
  }

  const stamp = nowIso();
  const expiresAt = quiz.timeLimitMinutes
    ? new Date(Date.now() + quiz.timeLimitMinutes * 60_000).toISOString()
    : null;

  const maxScore = questionIds.reduce((sum, id) => {
    const link = detail.questions.find((q) => q.question.id === id)?.link;
    const q = getQuestionById(id);
    return sum + (link?.pointsOverride ?? q?.points ?? 0);
  }, 0);

  const attempt: QuizAttempt = {
    id: generateId(),
    quizId: quiz.id,
    studentId: input.user.id,
    attemptNumber: completedCount + 1,
    status: "in_progress",
    startedAt: stamp,
    submittedAt: null,
    expiresAt,
    timeSpentSeconds: 0,
    score: null,
    maxScore,
    percent: null,
    passed: null,
    gradeStatus: "pending",
    questionIds,
    lastSavedAt: stamp,
    clientMeta: {},
    suspiciousEvents: [],
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeQuizzesDb((d) => {
    d.attempts.unshift(attempt);
    for (const qid of questionIds) {
      d.answers.push({
        id: generateId(),
        attemptId: attempt.id,
        questionId: qid,
        response: null,
        isCorrect: null,
        autoScore: null,
        manualScore: null,
        finalScore: null,
        needsManualGrading: needsManualGrading(getQuestionById(qid)?.type ?? "essay"),
        feedback: "",
        gradedById: null,
        gradedAt: null,
        createdAt: stamp,
        updatedAt: stamp,
      });
    }
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ATTEMPT_STARTED,
    entityType: "quiz_attempt",
    entityId: attempt.id,
    metadata: { quizId: quiz.id },
  });

  return {
    attempt,
    questions: buildStudentQuestions(attempt, quiz.randomAnswers, false),
  };
}

function buildStudentQuestions(
  attempt: QuizAttempt,
  randomAnswers: boolean,
  includeCorrect: boolean,
) {
  const quiz = getQuizOrThrow(attempt.quizId);
  return attempt.questionIds
    .map((id) => {
      const q = getQuestionById(id);
      if (!q) return null;
      let options = [...q.options].sort((a, b) => a.order - b.order);
      if (randomAnswers) options = shuffle(options);
      return {
        id: q.id,
        stem: q.stem,
        type: q.type,
        difficulty: q.difficulty,
        points:
          readQuizzesDb().quizQuestions.find(
            (l) => l.quizId === quiz.id && l.questionId === q.id,
          )?.pointsOverride ?? q.points,
        options: options.map((o) => ({ id: o.id, label: o.label, order: o.order, meta: o.meta })),
        explanation: includeCorrect && quiz.reviewAnswers ? q.explanation : undefined,
        correctAnswer: includeCorrect && quiz.reviewAnswers ? q.correctAnswer : undefined,
      };
    })
    .filter(Boolean);
}

export async function saveAttemptAnswers(input: {
  user: UserProfile;
  attemptId: string;
  answers: Array<{ questionId: string; response: unknown }>;
  timeSpentSeconds?: number;
  clientMeta?: Record<string, unknown>;
  suspicious?: { type: string; detail: string };
}): Promise<QuizAttempt> {
  let attempt = getAttemptById(input.attemptId);
  if (!attempt) throw new QuizAccessError("Attempt not found", 404);
  assertAttemptOwner(input.user, attempt.studentId);
  attempt = expireIfNeeded(attempt);
  if (attempt.status !== "in_progress") {
    throw new QuizAccessError("Attempt is no longer editable");
  }

  const quiz = getQuizOrThrow(attempt.quizId);
  if (!quiz.allowResume && attempt.lastSavedAt && attempt.lastSavedAt !== attempt.startedAt) {
    // Resume already used once — still allow autosave during active session
  }

  const stamp = nowIso();
  writeQuizzesDb((d) => {
    const idx = d.attempts.findIndex((a) => a.id === attempt!.id);
    if (idx >= 0) {
      const current = d.attempts[idx]!;
      const events = [...current.suspiciousEvents];
      if (input.suspicious) {
        events.push({ at: stamp, type: input.suspicious.type, detail: input.suspicious.detail });
      }
      d.attempts[idx] = {
        ...current,
        timeSpentSeconds: Math.max(
          current.timeSpentSeconds,
          input.timeSpentSeconds ?? current.timeSpentSeconds,
        ),
        lastSavedAt: stamp,
        clientMeta: { ...current.clientMeta, ...(input.clientMeta ?? {}) },
        suspiciousEvents: events,
        updatedAt: stamp,
      };
    }
    for (const ans of input.answers) {
      const aIdx = d.answers.findIndex(
        (a) => a.attemptId === attempt!.id && a.questionId === ans.questionId,
      );
      if (aIdx >= 0) {
        d.answers[aIdx] = {
          ...d.answers[aIdx]!,
          response: ans.response,
          updatedAt: stamp,
        };
      }
    }
  });

  if (input.suspicious) {
    await logActivity({
      actorId: input.user.id,
      action: ACTIVITY_ACTIONS.SUSPICIOUS_ACTIVITY,
      entityType: "quiz_attempt",
      entityId: attempt.id,
      metadata: input.suspicious,
    });
  } else {
    await logActivity({
      actorId: input.user.id,
      action: ACTIVITY_ACTIONS.ATTEMPT_SAVED,
      entityType: "quiz_attempt",
      entityId: attempt.id,
    });
  }

  return getAttemptById(attempt.id)!;
}

export async function submitAttempt(input: {
  user: UserProfile;
  attemptId: string;
  answers?: Array<{ questionId: string; response: unknown }>;
  timeSpentSeconds?: number;
}): Promise<{
  attempt: QuizAttempt;
  answers: QuizAnswer[];
  reviewAllowed: boolean;
}> {
  if (input.answers?.length) {
    await saveAttemptAnswers({
      user: input.user,
      attemptId: input.attemptId,
      answers: input.answers,
      timeSpentSeconds: input.timeSpentSeconds,
    });
  }

  let attempt = getAttemptById(input.attemptId);
  if (!attempt) throw new QuizAccessError("Attempt not found", 404);
  assertAttemptOwner(input.user, attempt.studentId);
  attempt = expireIfNeeded(attempt);
  if (attempt.status !== "in_progress" && attempt.status !== "expired") {
    throw new QuizAccessError("Attempt already submitted");
  }

  const quiz = getQuizOrThrow(attempt.quizId);
  const stamp = nowIso();
  let needsReview = false;
  let totalScore = 0;

  writeQuizzesDb((d) => {
    const answers = d.answers.filter((a) => a.attemptId === attempt!.id);
    for (const answer of answers) {
      const question = d.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;
      const link = d.quizQuestions.find(
        (l) => l.quizId === quiz.id && l.questionId === question.id,
      );
      const points = link?.pointsOverride ?? question.points;
      const graded = autoGradeResponse(question, answer.response, points);
      let final = graded.score;
      if (!graded.needsManual && graded.isCorrect === false && quiz.negativeMarking) {
        final = applyNegativeMarking(
          graded.isCorrect,
          graded.score,
          points,
          true,
          quiz.negativeMarkValue,
        );
      }
      if (graded.needsManual) needsReview = true;
      const aIdx = d.answers.findIndex((a) => a.id === answer.id);
      if (aIdx >= 0) {
        d.answers[aIdx] = {
          ...d.answers[aIdx]!,
          isCorrect: graded.isCorrect,
          autoScore: graded.score,
          finalScore: graded.needsManual ? null : final,
          needsManualGrading: graded.needsManual,
          updatedAt: stamp,
        };
      }
      if (!graded.needsManual && typeof final === "number") {
        totalScore += final;
      }
    }

    const maxScore = attempt!.maxScore || 1;
    const percent = Math.round((Math.max(0, totalScore) / maxScore) * 1000) / 10;
    const passed = !needsReview ? percent >= quiz.passingScore : null;

    const idx = d.attempts.findIndex((a) => a.id === attempt!.id);
    if (idx >= 0) {
      d.attempts[idx] = {
        ...d.attempts[idx]!,
        status: "submitted",
        submittedAt: stamp,
        timeSpentSeconds: Math.max(
          d.attempts[idx]!.timeSpentSeconds,
          input.timeSpentSeconds ?? d.attempts[idx]!.timeSpentSeconds,
        ),
        score: needsReview ? totalScore : Math.max(0, totalScore),
        percent: needsReview ? percent : percent,
        passed,
        gradeStatus: needsReview ? "needs_review" : "auto_graded",
        updatedAt: stamp,
      };
      if (!needsReview) {
        d.attempts[idx]!.status = "graded";
        d.attempts[idx]!.gradeStatus = "final";
      }
    }
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ATTEMPT_SUBMITTED,
    entityType: "quiz_attempt",
    entityId: attempt.id,
  });

  const updated = getAttemptById(attempt.id)!;
  return {
    attempt: updated,
    answers: getAnswersForAttempt(attempt.id),
    reviewAllowed: quiz.reviewAnswers && quiz.showResultsImmediately,
  };
}

export async function manualGradeAnswer(input: {
  user: UserProfile;
  attemptId: string;
  questionId: string;
  score: number;
  feedback?: string;
}): Promise<QuizAnswer> {
  assertCanManageQuizzes(input.user);
  const attempt = getAttemptById(input.attemptId);
  if (!attempt) throw new QuizAccessError("Attempt not found", 404);
  const stamp = nowIso();

  writeQuizzesDb((d) => {
    const aIdx = d.answers.findIndex(
      (a) => a.attemptId === input.attemptId && a.questionId === input.questionId,
    );
    if (aIdx < 0) throw new QuizAccessError("Answer not found", 404);
    d.answers[aIdx] = {
      ...d.answers[aIdx]!,
      manualScore: input.score,
      finalScore: input.score,
      feedback: input.feedback ?? "",
      needsManualGrading: false,
      gradedById: input.user.id,
      gradedAt: stamp,
      updatedAt: stamp,
    };
  });

  recalculateAttemptScore(input.attemptId);
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ATTEMPT_GRADED,
    entityType: "quiz_attempt",
    entityId: input.attemptId,
    metadata: { questionId: input.questionId },
  });
  return getAnswersForAttempt(input.attemptId).find((a) => a.questionId === input.questionId)!;
}

export async function finalizeAttemptReview(input: {
  user: UserProfile;
  attemptId: string;
  comments?: string;
  scoreAdjustment?: number;
  approved?: boolean;
}): Promise<QuizAttempt> {
  assertCanManageQuizzes(input.user);
  const attempt = getAttemptById(input.attemptId);
  if (!attempt) throw new QuizAccessError("Attempt not found", 404);
  const quiz = getQuizOrThrow(attempt.quizId);
  const stamp = nowIso();
  const adjustment = input.scoreAdjustment ?? 0;
  const answers = getAnswersForAttempt(input.attemptId);
  const pending = answers.some((a) => a.needsManualGrading || a.finalScore == null);
  if (pending && (input.approved ?? true)) {
    throw new QuizAccessError("All answers must be graded before approval", 400);
  }

  writeQuizzesDb((d) => {
    d.reviews = d.reviews.filter((r) => r.attemptId !== input.attemptId);
    d.reviews.push({
      id: generateId(),
      attemptId: input.attemptId,
      instructorId: input.user.id,
      comments: input.comments ?? "",
      scoreAdjustment: adjustment,
      approved: input.approved ?? true,
      createdAt: stamp,
      updatedAt: stamp,
    });

    const scored = d.answers.filter((a) => a.attemptId === input.attemptId);
    const base = scored.reduce((s, a) => s + (a.finalScore ?? 0), 0);
    const score = Math.max(0, base + adjustment);
    const percent = Math.round((score / (attempt.maxScore || 1)) * 1000) / 10;
    const idx = d.attempts.findIndex((a) => a.id === input.attemptId);
    if (idx >= 0) {
      d.attempts[idx] = {
        ...d.attempts[idx]!,
        score,
        percent,
        passed: percent >= quiz.passingScore,
        status: "graded",
        gradeStatus: "final",
        updatedAt: stamp,
      };
    }
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.ATTEMPT_GRADED,
    entityType: "quiz_attempt",
    entityId: input.attemptId,
    metadata: { finalized: true },
  });
  return getAttemptById(input.attemptId)!;
}

function recalculateAttemptScore(attemptId: string) {
  const attempt = getAttemptById(attemptId);
  if (!attempt) return;
  const quiz = getQuizOrThrow(attempt.quizId);
  writeQuizzesDb((d) => {
    const answers = d.answers.filter((a) => a.attemptId === attemptId);
    const pending = answers.some((a) => a.needsManualGrading || a.finalScore == null);
    const score = answers.reduce((s, a) => s + (a.finalScore ?? 0), 0);
    const percent = Math.round((Math.max(0, score) / (attempt.maxScore || 1)) * 1000) / 10;
    const idx = d.attempts.findIndex((a) => a.id === attemptId);
    if (idx >= 0) {
      d.attempts[idx] = {
        ...d.attempts[idx]!,
        score: Math.max(0, score),
        percent,
        passed: pending ? null : percent >= quiz.passingScore,
        gradeStatus: pending ? "needs_review" : "auto_graded",
        status: pending ? "submitted" : "graded",
        updatedAt: nowIso(),
      };
    }
  });
}

export function getAttemptReviewPayload(user: UserProfile, attemptId: string) {
  const attempt = getAttemptById(attemptId);
  if (!attempt) throw new QuizAccessError("Attempt not found", 404);
  assertAttemptOwner(user, attempt.studentId);
  const quiz = getQuizOrThrow(attempt.quizId);
  const isManager = canManageQuizzes(user);
  const includeCorrect =
    isManager ||
    (quiz.reviewAnswers &&
      (quiz.showResultsImmediately || attempt.gradeStatus === "final") &&
      attempt.status !== "in_progress");
  return {
    attempt,
    quiz,
    answers: getAnswersForAttempt(attemptId),
    questions: buildStudentQuestions(attempt, false, includeCorrect),
    review: readQuizzesDb().reviews.find((r) => r.attemptId === attemptId) ?? null,
  };
}
