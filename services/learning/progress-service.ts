/**
 * Lesson / course progress tracking for enrolled students.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { maybeAutoIssueCertificate } from "@/services/certificates/certificate-service";
import { getCourseDetail } from "@/services/courses/course-service";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { courseAllowsSequentialLock } from "@/services/journeys/customer-journey-catalog";
import {
  assertStudentEnrolled,
  getActiveEnrollment,
  LearningAccessError,
} from "@/services/learning/access";
import { recordHistory } from "@/services/learning/history-service";
import { syncGoalHoursFromProgress } from "@/services/learning/planner-service";
import { readLearningDb, writeLearningDb } from "@/services/learning/store";
import type { CourseLearningState, LessonProgressRecord } from "@/types/learning";
import type { UserProfile } from "@/types";

/** When sequential lock is enabled, previous published lessons must be completed. */
export function assertLessonUnlocked(studentId: string, courseId: string, lessonId: string) {
  const course = getCourseDetail(courseId);
  if (!course || !courseAllowsSequentialLock(course)) return;
  const lessons = publishedLessons(courseId);
  const index = lessons.findIndex((e) => e.lesson.id === lessonId);
  if (index <= 0) return;
  const rows = listProgressForStudent(studentId).filter((p) => p.courseId === courseId);
  for (let i = 0; i < index; i++) {
    const prev = lessons[i]!;
    const row = rows.find((r) => r.lessonId === prev.lesson.id);
    if (!row?.completed) {
      throw new LearningAccessError(
        `Complete “${prev.lesson.title}” before opening the next lesson.`,
        403,
      );
    }
  }
}

export function listProgressForStudent(studentId: string): LessonProgressRecord[] {
  return readLearningDb()
    .progress.filter((p) => p.studentId === studentId)
    .sort((a, b) => (b.lastAccessedAt ?? "").localeCompare(a.lastAccessedAt ?? ""));
}

export function getLessonProgress(
  studentId: string,
  lessonId: string,
): LessonProgressRecord | null {
  return (
    readLearningDb().progress.find((p) => p.studentId === studentId && p.lessonId === lessonId) ??
    null
  );
}

function publishedLessons(courseId: string) {
  const detail = getCourseDetail(courseId);
  if (!detail) return [];
  return detail.modules
    .filter((m) => m.visible && m.status !== "hidden")
    .flatMap((m) =>
      m.lessons
        .filter((l) => l.status !== "hidden")
        .sort((a, b) => a.order - b.order)
        .map((l) => ({ moduleId: m.id, lesson: l })),
    );
}

export function getCourseLearningState(studentId: string, courseId: string): CourseLearningState {
  const enrollment = getActiveEnrollment(studentId, courseId);
  if (!enrollment) {
    throw new LearningAccessError("You are not enrolled in this course");
  }

  const lessons = publishedLessons(courseId);
  const rows = listProgressForStudent(studentId).filter((p) => p.courseId === courseId);
  const completedLessons = rows.filter((r) => r.completed).length;
  const totalLessons = lessons.length;
  const progressPercent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 1000) / 10;
  const timeSpentSeconds = rows.reduce((s, r) => s + r.timeSpentSeconds, 0);
  const last = [...rows].sort((a, b) =>
    (b.lastAccessedAt ?? "").localeCompare(a.lastAccessedAt ?? ""),
  )[0];

  let lastLessonId = last?.lessonId ?? null;
  let lastModuleId = last?.moduleId ?? null;

  if (!lastLessonId && lessons[0]) {
    lastLessonId = lessons[0].lesson.id;
    lastModuleId = lessons[0].moduleId;
  } else if (last?.completed) {
    const next = lessons.find((entry) => {
      const row = rows.find((r) => r.lessonId === entry.lesson.id);
      return !row?.completed;
    });
    if (next) {
      lastLessonId = next.lesson.id;
      lastModuleId = next.moduleId;
    }
  }

  const store = readLearningDb();
  const bookmarked = store.bookmarks.some(
    (b) => b.studentId === studentId && b.targetType === "lesson" && b.courseId === courseId,
  );
  const favorited = store.favorites.some(
    (f) => f.studentId === studentId && f.targetType === "course" && f.targetId === courseId,
  );

  const startedAt =
    rows
      .map((r) => r.startedAt)
      .filter(Boolean)
      .sort()[0] ?? null;
  const allDone = totalLessons > 0 && completedLessons >= totalLessons;
  const completedAt = allDone
    ? (rows
        .map((r) => r.completedAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null)
    : null;

  return {
    studentId,
    courseId,
    enrollmentId: enrollment.id,
    lastLessonId,
    lastModuleId,
    progressPercent,
    completedLessons,
    totalLessons,
    timeSpentSeconds,
    bookmarked,
    favorited,
    startedAt,
    lastAccessedAt: last?.lastAccessedAt ?? null,
    completedAt,
  };
}

export function getOverallProgress(studentId: string): {
  activeCourses: number;
  completedCourses: number;
  learningHours: number;
  progressPercent: number;
  lessonsStarted: number;
  lessonsCompleted: number;
} {
  const courseIds = listStudentEnrollments(studentId)
    .filter((e) => ["approved", "completed", "pending"].includes(e.status))
    .map((e) => e.courseId);

  let activeCourses = 0;
  let completedCourses = 0;
  let sumPct = 0;

  for (const courseId of courseIds) {
    try {
      const state = getCourseLearningState(studentId, courseId);
      sumPct += state.progressPercent;
      if (state.progressPercent >= 100) completedCourses += 1;
      else if (state.completedLessons > 0 || state.startedAt) activeCourses += 1;
      else activeCourses += 1;
    } catch {
      /* skip */
    }
  }

  const progress = listProgressForStudent(studentId);
  const totalSeconds = progress.reduce((s, p) => s + p.timeSpentSeconds, 0);

  return {
    activeCourses,
    completedCourses,
    learningHours: Math.round((totalSeconds / 3600) * 10) / 10,
    progressPercent: courseIds.length === 0 ? 0 : Math.round((sumPct / courseIds.length) * 10) / 10,
    lessonsStarted: progress.filter((p) => p.startedAt || p.timeSpentSeconds > 0 || p.completed)
      .length,
    lessonsCompleted: progress.filter((p) => p.completed).length,
  };
}

export async function touchLessonProgress(input: {
  user: UserProfile;
  courseId: string;
  lessonId: string;
  deltaSeconds?: number;
  resumePosition?: number;
  markStarted?: boolean;
}): Promise<LessonProgressRecord> {
  const enrollment = assertStudentEnrolled(input.user, input.courseId);
  const found = publishedLessons(input.courseId).find((e) => e.lesson.id === input.lessonId);
  if (!found) throw new LearningAccessError("Lesson not found", 404);
  assertLessonUnlocked(input.user.id, input.courseId, input.lessonId);

  const now = new Date().toISOString();
  const delta = Math.max(0, Math.min(input.deltaSeconds ?? 0, 300));
  let justStarted = false;
  let courseStarted = false;

  writeLearningDb((d) => {
    let row = d.progress.find(
      (p) => p.studentId === input.user.id && p.lessonId === input.lessonId,
    );
    if (!row) {
      const hadCourse = d.progress.some(
        (p) => p.studentId === input.user.id && p.courseId === input.courseId,
      );
      courseStarted = !hadCourse;
      row = {
        id: generateId(),
        studentId: input.user.id,
        enrollmentId: enrollment.id,
        courseId: input.courseId,
        lessonId: input.lessonId,
        moduleId: found.moduleId,
        completed: false,
        completedAt: null,
        timeSpentSeconds: 0,
        resumePosition: 0,
        lastAccessedAt: now,
        startedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      d.progress.push(row);
    }

    if (!row.startedAt) {
      row.startedAt = now;
      justStarted = true;
    }

    row.timeSpentSeconds += delta;
    if (typeof input.resumePosition === "number") {
      row.resumePosition = Math.max(0, input.resumePosition);
    }
    row.lastAccessedAt = now;
    row.updatedAt = now;
  });

  if (courseStarted) {
    await recordHistory({
      studentId: input.user.id,
      type: "course_started",
      title: `Started course`,
      courseId: input.courseId,
      lessonId: input.lessonId,
    });
  }
  if (justStarted) {
    await recordHistory({
      studentId: input.user.id,
      type: "lesson_started",
      title: `Started: ${found.lesson.title}`,
      courseId: input.courseId,
      lessonId: input.lessonId,
    });
    await logActivity({
      actorId: input.user.id,
      action: ACTIVITY_ACTIONS.LESSON_STARTED,
      entityType: "lesson",
      entityId: input.lessonId,
      metadata: { courseId: input.courseId },
    });
  } else if (delta > 0) {
    await logActivity({
      actorId: input.user.id,
      action: ACTIVITY_ACTIONS.PROGRESS_UPDATED,
      entityType: "lesson",
      entityId: input.lessonId,
      metadata: { courseId: input.courseId, deltaSeconds: delta },
    });
  }

  syncGoalHoursFromProgress(input.user.id);
  const updated = getLessonProgress(input.user.id, input.lessonId);
  if (!updated) throw new LearningAccessError("Progress row missing", 404);
  return updated;
}

export async function completeLessonProgress(input: {
  user: UserProfile;
  courseId: string;
  lessonId: string;
}): Promise<LessonProgressRecord> {
  await touchLessonProgress({
    user: input.user,
    courseId: input.courseId,
    lessonId: input.lessonId,
    markStarted: true,
    deltaSeconds: 30,
  });

  const found = publishedLessons(input.courseId).find((e) => e.lesson.id === input.lessonId);
  const now = new Date().toISOString();

  writeLearningDb((d) => {
    const row = d.progress.find(
      (p) => p.studentId === input.user.id && p.lessonId === input.lessonId,
    );
    if (!row) throw new LearningAccessError("Progress row missing", 404);
    row.completed = true;
    row.completedAt = now;
    row.lastAccessedAt = now;
    row.updatedAt = now;
  });

  await recordHistory({
    studentId: input.user.id,
    type: "lesson_completed",
    title: `Completed: ${found?.lesson.title ?? input.lessonId}`,
    courseId: input.courseId,
    lessonId: input.lessonId,
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.LESSON_COMPLETED,
    entityType: "lesson",
    entityId: input.lessonId,
    metadata: { courseId: input.courseId },
  });

  syncGoalHoursFromProgress(input.user.id);

  // Customer journey: auto-issue AviatorPass certificate at 100% progress.
  try {
    await maybeAutoIssueCertificate({
      actor: input.user,
      studentId: input.user.id,
      courseId: input.courseId,
    });
  } catch {
    /* certificate issuance is best-effort */
  }

  return getLessonProgress(input.user.id, input.lessonId)!;
}

export async function recordResourceDownload(input: {
  user: UserProfile;
  courseId: string;
  lessonId?: string | null;
  resourceId: string;
  title: string;
}): Promise<void> {
  assertStudentEnrolled(input.user, input.courseId);
  await recordHistory({
    studentId: input.user.id,
    type: "resource_downloaded",
    title: `Downloaded: ${input.title}`,
    courseId: input.courseId,
    lessonId: input.lessonId,
    metadata: { resourceId: input.resourceId },
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.RESOURCE_DOWNLOADED,
    entityType: "resource",
    entityId: input.resourceId,
    metadata: { courseId: input.courseId },
  });
}

export function getAdjacentLessons(
  courseId: string,
  lessonId: string,
): {
  prev: { id: string; title: string; moduleId: string } | null;
  next: { id: string; title: string; moduleId: string } | null;
} {
  const lessons = publishedLessons(courseId);
  const idx = lessons.findIndex((e) => e.lesson.id === lessonId);
  if (idx < 0) return { prev: null, next: null };
  const prev = idx > 0 ? lessons[idx - 1]! : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1]! : null;
  return {
    prev: prev ? { id: prev.lesson.id, title: prev.lesson.title, moduleId: prev.moduleId } : null,
    next: next ? { id: next.lesson.id, title: next.lesson.title, moduleId: next.moduleId } : null,
  };
}
