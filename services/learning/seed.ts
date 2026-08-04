/**
 * Seed light learning progress for demo students.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { getCourseDetail } from "@/services/courses/course-service";
import { readLearningDb, writeLearningDb } from "@/services/learning/store";
import type { LessonProgressRecord, StudyGoal } from "@/types/learning";
import { endOfWeek, startOfWeek } from "date-fns";

export function ensureLearningSeeded(): void {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const db = readLearningDb();
  if (db.seeded && db.progress.length > 0) return;

  const student = readAuthDb().users.find(
    (u) => u.role === ROLES.STUDENT && u.status === "active",
  );
  if (!student) {
    writeLearningDb((d) => {
      d.seeded = true;
    });
    return;
  }

  const enrollments = listStudentEnrollments(student.id).filter((e) => e.status === "approved");
  const progress: LessonProgressRecord[] = [];
  const now = new Date().toISOString();

  for (const e of enrollments.slice(0, 2)) {
    const detail = getCourseDetail(e.courseId);
    if (!detail) continue;
    const lessons = detail.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleId: m.id })),
    );
    lessons.slice(0, 2).forEach((lesson, idx) => {
      progress.push({
        id: generateId(),
        studentId: student.id,
        enrollmentId: e.id,
        courseId: e.courseId,
        lessonId: lesson.id,
        moduleId: lesson.moduleId,
        completed: idx === 0,
        completedAt: idx === 0 ? now : null,
        timeSpentSeconds: 1200 + idx * 600,
        resumePosition: idx === 0 ? 0 : 45,
        lastAccessedAt: now,
        startedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  const weekStart = startOfWeek(new Date()).toISOString();
  const weekEnd = endOfWeek(new Date()).toISOString();
  const goal: StudyGoal = {
    id: generateId(),
    studentId: student.id,
    title: "Study 4 hours this week",
    period: "weekly",
    targetHours: 4,
    completedHours: 1.5,
    status: "active",
    startsAt: weekStart,
    endsAt: weekEnd,
    aiSuggested: false,
    createdAt: now,
    updatedAt: now,
  };

  writeLearningDb((d) => {
    d.progress = progress;
    d.goals = [goal];
    d.history = progress.map((p) => ({
      id: generateId(),
      studentId: student.id,
      type: p.completed ? ("lesson_completed" as const) : ("lesson_started" as const),
      title: p.completed ? "Completed a lesson" : "Started a lesson",
      description: "",
      courseId: p.courseId,
      lessonId: p.lessonId,
      metadata: {},
      createdAt: now,
    }));
    d.seeded = true;
  });
}
