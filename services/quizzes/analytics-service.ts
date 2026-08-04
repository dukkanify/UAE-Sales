/**
 * Assessment analytics aggregates.
 */

import { getQuestionById } from "@/services/quizzes/question-bank-service";
import { listAttemptsForQuiz } from "@/services/quizzes/attempt-service";
import { readQuizzesDb } from "@/services/quizzes/store";
import type { AssessmentAnalyticsSnapshot } from "@/types/quizzes";

export function getQuizAnalytics(quizId: string): AssessmentAnalyticsSnapshot {
  const attempts = listAttemptsForQuiz(quizId).filter((a) =>
    ["submitted", "graded", "expired"].includes(a.status),
  );
  const scored = attempts.filter((a) => typeof a.percent === "number");
  const percents = scored.map((a) => a.percent as number);
  const averageScore =
    percents.length === 0
      ? 0
      : Math.round((percents.reduce((s, n) => s + n, 0) / percents.length) * 10) / 10;
  const highestScore = percents.length ? Math.max(...percents) : 0;
  const lowestScore = percents.length ? Math.min(...percents) : 0;
  const passed = scored.filter((a) => a.passed).length;
  const passRate =
    scored.length === 0 ? 0 : Math.round((passed / scored.length) * 1000) / 10;
  const failureRate = scored.length === 0 ? 0 : Math.round((100 - passRate) * 10) / 10;
  const averageTimeSeconds =
    attempts.length === 0
      ? 0
      : Math.round(
          attempts.reduce((s, a) => s + a.timeSpentSeconds, 0) / attempts.length,
        );

  const answerRows = readQuizzesDb().answers.filter((ans) =>
    attempts.some((a) => a.id === ans.attemptId),
  );
  const byQuestion = new Map<string, { correct: number; total: number; scoreSum: number }>();
  for (const ans of answerRows) {
    const bucket = byQuestion.get(ans.questionId) ?? { correct: 0, total: 0, scoreSum: 0 };
    bucket.total += 1;
    if (ans.isCorrect) bucket.correct += 1;
    bucket.scoreSum += ans.finalScore ?? ans.autoScore ?? 0;
    byQuestion.set(ans.questionId, bucket);
  }

  const questionStats = [...byQuestion.entries()].map(([questionId, stats]) => {
    const q = getQuestionById(questionId);
    return {
      questionId,
      stem: q?.stem ?? questionId,
      attempts: stats.total,
      correctRate:
        stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 1000) / 10,
      avgScore:
        stats.total === 0 ? 0 : Math.round((stats.scoreSum / stats.total) * 10) / 10,
    };
  });

  const frequentlyMissed = [...questionStats]
    .map((s) => ({
      questionId: s.questionId,
      stem: s.stem,
      missRate: Math.round((100 - s.correctRate) * 10) / 10,
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 10);

  return {
    quizId,
    attemptsCount: attempts.length,
    completedCount: scored.length,
    averageScore,
    highestScore,
    lowestScore,
    passRate,
    failureRate,
    averageTimeSeconds,
    questionStats,
    frequentlyMissed,
  };
}

export function getPlatformAssessmentOverview() {
  const db = readQuizzesDb();
  const quizzes = db.quizzes.filter((q) => !q.deletedAt);
  const attempts = db.attempts.filter((a) =>
    ["submitted", "graded", "expired"].includes(a.status),
  );
  const needsReview = db.attempts.filter((a) => a.gradeStatus === "needs_review").length;
  return {
    totalQuizzes: quizzes.length,
    publishedQuizzes: quizzes.filter((q) => q.status === "published").length,
    totalQuestions: db.questions.filter((q) => !q.deletedAt).length,
    totalAttempts: attempts.length,
    needsReview,
  };
}
