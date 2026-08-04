/**
 * Build grounded platform context for prompts (never invent enrollments).
 */

import { ROLES } from "@/constants/roles";
import { readCoursesDb } from "@/services/courses/store";
import { listCourses } from "@/services/courses/course-service";
import { readLearningDb } from "@/services/learning/store";
import { getLearningDashboard } from "@/services/learning/learning-service";
import { getClassStats } from "@/services/classes/class-service";
import { getStudentProgressSnapshot } from "@/services/certificates/progress-service";
import { resolvePersona } from "@/services/ai/access";
import type { AiUserContext } from "@/types/ai";
import type { UserProfile } from "@/types";

export function buildUserContext(user: UserProfile): AiUserContext {
  const persona = resolvePersona(user);
  const courses = listCourses({ pageSize: 50 }).data;
  const learning = readLearningDb();
  const enrollments = readCoursesDb().enrollments.filter((e) => e.studentId === user.id);

  let enrolledCourses: AiUserContext["enrolledCourses"] = [];
  let quizAvg = 0;
  let goals: string[] = [];
  let recentLessons: AiUserContext["recentLessons"] = [];
  let liveUpcoming = 0;

  if (persona === "student") {
    const dash = getLearningDashboard(user);
    const snap = getStudentProgressSnapshot(user.id);
    quizAvg = Math.round(snap.averageQuizScore ?? 0);
    goals = (learning.goals ?? [])
      .filter((g) => g.studentId === user.id && g.status !== "completed")
      .map((g) => `${g.period} goal: ${g.targetHours}h`);
    enrolledCourses = enrollments.map((e) => {
      const c = courses.find((x) => x.id === e.courseId);
      const progress = snap.courseProgress.find((p) => p.courseId === e.courseId);
      return {
        id: e.courseId,
        title: c?.title ?? "Course",
        code: c?.code ?? "",
        progress: Math.round(progress?.percent ?? 0),
      };
    });
    recentLessons = (learning.progress ?? [])
      .filter((p) => p.studentId === user.id)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
      .slice(0, 5)
      .map((p) => {
        const lesson = readCoursesDb().lessons.find((l) => l.id === p.lessonId);
        return {
          id: p.lessonId,
          title: lesson?.title ?? "Lesson",
          courseId: p.courseId,
        };
      });
    liveUpcoming = dash.upcomingLiveClass ? 1 : getClassStats().upcoming;
  } else if (persona === "instructor") {
    const mine = courses.filter((c) => c.primaryInstructorId === user.id);
    enrolledCourses = mine.map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      progress: 0,
    }));
    liveUpcoming = getClassStats(user.id).upcoming;
  } else {
    enrolledCourses = courses.slice(0, 8).map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      progress: 0,
    }));
    liveUpcoming = getClassStats().upcoming;
  }

  return {
    persona,
    enrolledCourses,
    recentLessons,
    quizAvg,
    goals,
    liveUpcoming,
    roleLabel:
      user.role === ROLES.SUPER_ADMIN
        ? "Super Admin"
        : user.role === ROLES.ADMIN
          ? "Admin"
          : user.role === ROLES.INSTRUCTOR
            ? "Instructor"
            : "Student",
  };
}
