/**
 * AI course recommendations grounded in enrollments + progress.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { assertAiAccess, AiError } from "@/services/ai/access";
import { ensureAiSeeded } from "@/services/ai/seed";
import { writeAiDb, readAiDb } from "@/services/ai/store";
import { listCourses } from "@/services/courses/course-service";
import { readCoursesDb } from "@/services/courses/store";
import { getStudentProgressSnapshot } from "@/services/certificates/progress-service";
import type { AiRecommendation } from "@/types/ai";
import type { UserProfile } from "@/types";
import { ROLES } from "@/constants/roles";

export function getCourseRecommendations(user: UserProfile): AiRecommendation[] {
  ensureAiSeeded();
  assertAiAccess(user);
  if (user.role !== ROLES.STUDENT) {
    throw new AiError("Course recommendations are for students", 403);
  }

  const courses = listCourses({ pageSize: 50, status: "published" }).data;
  const enrolledIds = new Set(
    readCoursesDb().enrollments.filter((e) => e.studentId === user.id).map((e) => e.courseId),
  );
  const snap = getStudentProgressSnapshot(user.id);
  const avgQuiz = snap.averageQuizScore ?? 0;

  const scored = courses
    .filter((c) => !enrolledIds.has(c.id))
    .map((c) => {
      let score = 40;
      const relatedCategory = snap.courseProgress.some((p) => {
        const enrolled = courses.find((x) => x.id === p.courseId);
        return enrolled?.categoryId && enrolled.categoryId === c.categoryId;
      });
      if (relatedCategory) score += 25;
      if (avgQuiz < 60) score += 10;
      if (c.difficulty === "advanced" || c.code.toLowerCase().includes("atpl")) score += 15;
      const reasonParts = [
        enrolledIds.size
          ? "Builds on your current learning path"
          : "Popular starting point for new students",
        avgQuiz < 70 ? "Supports quiz improvement" : "Matches strong quiz trajectory",
        c.categoryName ? `Category: ${c.categoryName}` : null,
      ].filter(Boolean);
      return {
        course: c,
        score,
        reason: reasonParts.join(". "),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const continueRecs: AiRecommendation[] = snap.courseProgress
    .filter((p) => p.percent < 100)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3)
    .map((p) => {
      const course = courses.find((c) => c.id === p.courseId);
      return {
        id: generateId(),
        studentId: user.id,
        courseId: p.courseId,
        courseTitle: p.courseTitle,
        reason: `Continue — currently ${Math.round(p.percent)}% complete`,
        score: 90 - Math.round(p.percent / 2),
        categoryId: course?.categoryId ?? null,
        createdAt: new Date().toISOString(),
      };
    });

  const fresh: AiRecommendation[] = scored.map((s) => ({
    id: generateId(),
    studentId: user.id,
    courseId: s.course.id,
    courseTitle: s.course.title,
    reason: s.reason,
    score: s.score,
    categoryId: s.course.categoryId ?? null,
    createdAt: new Date().toISOString(),
  }));

  const all = [...continueRecs, ...fresh].sort((a, b) => b.score - a.score);
  writeAiDb((db) => {
    db.recommendations = [
      ...all,
      ...db.recommendations.filter((r) => r.studentId !== user.id),
    ].slice(0, 200);
  });
  void logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.AI_RECOMMENDATION,
    entityType: "ai_recommendation",
    entityId: user.id,
  });
  return all;
}

export function listRecommendationHistory(studentId: string) {
  return readAiDb()
    .recommendations.filter((r) => r.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 40);
}
