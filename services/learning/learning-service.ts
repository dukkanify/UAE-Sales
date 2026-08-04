/**
 * Learning service — dashboard overview, enrolled courses, resources, resume.
 */

import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { getCourseById, getCourseDetail, listCourses } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { listLiveClasses } from "@/services/classes/class-service";
import { readClassesDb } from "@/services/classes/store";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { listNotifications } from "@/services/notifications/notification-service";
import {
  getCourseLearningState,
  getOverallProgress,
  listProgressForStudent,
} from "@/services/learning/progress-service";
import { listHistory } from "@/services/learning/history-service";
import {
  listGoals,
  listStudySessions,
  syncGoalHoursFromProgress,
} from "@/services/learning/planner-service";
import { ensureLearningSeeded } from "@/services/learning/seed";
import { readLearningDb, writeLearningDb } from "@/services/learning/store";
import { generateId } from "@/lib/security/crypto";
import type {
  CourseLearningState,
  LearningCalendarItem,
  LearningDashboardOverview,
  OfflineCacheEntry,
  ResourceLibraryItem,
} from "@/types/learning";
import type { UserProfile } from "@/types";
import type { CourseListItem } from "@/types/courses";

export type { LearningCalendarItem };

export function listMyCourses(
  studentId: string,
  options?: {
    q?: string;
    sort?: "title" | "progress" | "recent";
    favoritedOnly?: boolean;
  },
): Array<CourseListItem & { learning: CourseLearningState | null }> {
  ensureCoursesSeeded();
  ensureLearningSeeded();
  const enrollments = listStudentEnrollments(studentId).filter((e) =>
    ["approved", "completed", "pending"].includes(e.status),
  );
  const all = listCourses({ pageSize: 500 }).data;
  const byId = new Map(all.map((c) => [c.id, c]));
  let rows: Array<CourseListItem & { learning: CourseLearningState | null }> = [];

  for (const e of enrollments) {
    const course = byId.get(e.courseId);
    if (!course) continue;
    let learning: CourseLearningState | null = null;
    try {
      learning = getCourseLearningState(studentId, e.courseId);
    } catch {
      learning = null;
    }
    rows.push({ ...course, learning });
  }

  if (options?.favoritedOnly) {
    const favIds = new Set(
      readLearningDb()
        .favorites.filter((f) => f.studentId === studentId && f.targetType === "course")
        .map((f) => f.targetId),
    );
    rows = rows.filter((r) => favIds.has(r.id));
  }
  if (options?.q) {
    const q = options.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.shortDescription.toLowerCase().includes(q),
    );
  }

  const sort = options?.sort ?? "recent";
  rows = [...rows].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "progress") {
      return (b.learning?.progressPercent ?? 0) - (a.learning?.progressPercent ?? 0);
    }
    return (b.learning?.lastAccessedAt ?? "").localeCompare(a.learning?.lastAccessedAt ?? "");
  });

  return rows;
}

export function getResumeTarget(studentId: string): LearningDashboardOverview["resume"] {
  const progress = listProgressForStudent(studentId)
    .filter((p) => !p.completed)
    .sort((a, b) => (b.lastAccessedAt ?? "").localeCompare(a.lastAccessedAt ?? ""));
  const row = progress[0];
  if (!row) {
    // Fall back to first enrolled course first lesson
    const courses = listMyCourses(studentId);
    const first = courses[0];
    if (!first) return null;
    const detail = getCourseDetail(first.id);
    const lesson = detail?.modules[0]?.lessons[0];
    if (!lesson) return null;
    return {
      courseId: first.id,
      courseTitle: first.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
    };
  }
  const course = getCourseById(row.courseId);
  const detail = getCourseDetail(row.courseId);
  const lesson = detail?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === row.lessonId);
  return {
    courseId: row.courseId,
    courseTitle: course?.title ?? "Course",
    lessonId: row.lessonId,
    lessonTitle: lesson?.title ?? "Lesson",
  };
}

export function getLearningDashboard(user: UserProfile): LearningDashboardOverview {
  ensureCoursesSeeded();
  ensureClassesSeeded();
  ensureLearningSeeded();
  syncGoalHoursFromProgress(user.id);
  const overall = getOverallProgress(user.id);
  const notifications = listNotifications(user.id, { pageSize: 1 });

  // Upcoming live class for this student
  const allowed = new Set(
    readClassesDb()
      .participants.filter((p) => p.userId === user.id)
      .map((p) => p.liveClassId),
  );
  const upcoming = listLiveClasses({ status: "upcoming", pageSize: 20 }).data.filter((c) =>
    allowed.has(c.id),
  )[0];

  const goals = listGoals(user.id).filter((g) => g.status === "active" && g.period === "weekly");
  const weeklyGoal = goals[0];
  const weeklyGoalPercent = weeklyGoal
    ? Math.min(100, Math.round((weeklyGoal.completedHours / weeklyGoal.targetHours) * 100))
    : 0;

  return {
    activeCourses: overall.activeCourses,
    completedCourses: overall.completedCourses,
    upcomingLiveClass: upcoming
      ? `${upcoming.title} · ${new Date(upcoming.startsAt).toLocaleString()}`
      : null,
    upcomingLiveClassId: upcoming?.id ?? null,
    learningHours: overall.learningHours,
    progressPercent: overall.progressPercent,
    assignments: 0,
    notifications: notifications.unreadCount,
    resume: getResumeTarget(user.id),
    recentActivity: listHistory(user.id, { limit: 8 }),
    weeklyGoalPercent,
  };
}

export function listResourceLibrary(
  studentId: string,
  options?: { q?: string; type?: string },
): ResourceLibraryItem[] {
  const courses = listMyCourses(studentId);
  const items: ResourceLibraryItem[] = [];
  for (const course of courses) {
    const detail = getCourseDetail(course.id);
    if (!detail) continue;
    for (const mod of detail.modules) {
      for (const lesson of mod.lessons) {
        for (const res of lesson.resources) {
          items.push({
            id: res.id,
            title: res.title,
            type: res.type,
            url: res.url,
            courseId: course.id,
            courseTitle: course.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            downloadable: res.downloadable,
            fileName: res.fileName,
          });
        }
      }
    }
  }
  let rows = items;
  if (options?.type && options.type !== "all") {
    rows = rows.filter((r) => r.type === options.type);
  }
  if (options?.q) {
    const q = options.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        r.lessonTitle.toLowerCase().includes(q),
    );
  }
  return rows;
}

export function registerOfflineCache(input: {
  studentId: string;
  courseId: string;
  lessonId: string;
  contentVersion?: string;
  sizeBytes?: number | null;
}): OfflineCacheEntry {
  const now = new Date().toISOString();
  const entry: OfflineCacheEntry = {
    id: generateId(),
    studentId: input.studentId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    cachedAt: now,
    contentVersion: input.contentVersion ?? now,
    sizeBytes: input.sizeBytes ?? null,
    syncedAt: null,
  };
  writeLearningDb((d) => {
    d.offlineCache = d.offlineCache.filter(
      (c) =>
        !(
          c.studentId === input.studentId &&
          c.lessonId === input.lessonId
        ),
    );
    d.offlineCache.push(entry);
  });
  return entry;
}

export function listOfflineCache(studentId: string): OfflineCacheEntry[] {
  return readLearningDb().offlineCache.filter((c) => c.studentId === studentId);
}

export function getLearningCalendar(studentId: string): LearningCalendarItem[] {
  ensureClassesSeeded();
  ensureLearningSeeded();
  const now = Date.now();
  const items: LearningCalendarItem[] = [];

  const allowed = new Set(
    readClassesDb()
      .participants.filter((p) => p.userId === studentId)
      .map((p) => p.liveClassId),
  );
  for (const c of listLiveClasses({ pageSize: 100 }).data) {
    if (!allowed.has(c.id)) continue;
    const start = Date.parse(c.startsAt);
    const completed = c.status === "completed" || start < now - 60_000;
    items.push({
      id: `class-${c.id}`,
      title: c.title,
      type: "live_class",
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      status: completed ? "completed" : start > now ? "upcoming" : "past",
      href: `/student/calendar`,
      courseId: c.courseId,
    });
  }

  for (const s of listStudySessions(studentId)) {
    const start = Date.parse(s.scheduledStart);
    items.push({
      id: `session-${s.id}`,
      title: s.title,
      type: "study_session",
      startsAt: s.scheduledStart,
      endsAt: s.scheduledEnd,
      status: s.completed ? "completed" : start > now ? "upcoming" : "past",
      href: `/student/planner`,
      courseId: s.courseId,
    });
  }

  // Soft deadlines: resume incomplete lessons as study plan cues
  for (const course of listMyCourses(studentId).slice(0, 8)) {
    if (!course.learning?.lastLessonId) continue;
    const detail = getCourseDetail(course.id);
    const lesson = detail?.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === course.learning?.lastLessonId);
    if (!lesson) continue;
    items.push({
      id: `lesson-${lesson.id}`,
      title: `Continue: ${lesson.title}`,
      type: "lesson",
      startsAt: course.learning.lastAccessedAt ?? new Date().toISOString(),
      endsAt: null,
      status: "upcoming",
      href: `/student/courses/${course.id}/lessons/${lesson.id}`,
      courseId: course.id,
    });
  }

  return items.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function searchLearning(
  studentId: string,
  q: string,
): {
  courses: CourseListItem[];
  lessons: Array<{ id: string; title: string; courseId: string; courseTitle: string }>;
  resources: ResourceLibraryItem[];
} {
  const query = q.trim().toLowerCase();
  if (!query) return { courses: [], lessons: [], resources: [] };
  const courses = listMyCourses(studentId, { q: query });
  const lessons: Array<{ id: string; title: string; courseId: string; courseTitle: string }> = [];
  for (const c of listMyCourses(studentId)) {
    const detail = getCourseDetail(c.id);
    if (!detail) continue;
    for (const m of detail.modules) {
      for (const l of m.lessons) {
        if (l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query)) {
          lessons.push({
            id: l.id,
            title: l.title,
            courseId: c.id,
            courseTitle: c.title,
          });
        }
      }
    }
  }
  return {
    courses: courses.map(({ learning, ...c }) => {
      void learning;
      return c;
    }),
    lessons,
    resources: listResourceLibrary(studentId, { q: query }),
  };
}
