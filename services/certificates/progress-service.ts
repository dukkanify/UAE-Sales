/**
 * Aggregated student progress, academic performance, timeline.
 */

import { ROLES } from "@/constants/roles";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { getCourseById } from "@/services/courses/course-service";
import {
  getCourseLearningState,
  getOverallProgress,
  listProgressForStudent,
} from "@/services/learning/progress-service";
import { listHistory } from "@/services/learning/history-service";
import { listAttemptsForStudent } from "@/services/quizzes/attempt-service";
import { getAttendanceOverview } from "@/services/classes/attendance-service";
import { listCertificates } from "@/services/certificates/certificate-service";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { ensureLearningSeeded } from "@/services/learning/seed";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import type {
  AcademicPerformance,
  ProgressTimelineEvent,
  StudentProgressSnapshot,
} from "@/types/certificates";

function studyStreakDays(studentId: string): number {
  const days = new Set(
    listProgressForStudent(studentId)
      .map((p) => (p.lastAccessedAt ?? p.updatedAt).slice(0, 10))
      .filter(Boolean),
  );
  if (!days.size) return 0;
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 60) break;
  }
  return streak;
}

export function getStudentProgressSnapshot(studentId: string): StudentProgressSnapshot {
  ensureLearningSeeded();
  ensureQuizzesSeeded();
  ensureCertificatesSeeded();

  const overall = getOverallProgress(studentId);
  const enrollments = listStudentEnrollments(studentId).filter((e) =>
    ["approved", "completed", "pending"].includes(e.status),
  );

  const courseProgress = enrollments.map((e) => {
    const course = getCourseById(e.courseId);
    try {
      const state = getCourseLearningState(studentId, e.courseId);
      return {
        courseId: e.courseId,
        courseTitle: course?.title ?? e.courseId,
        percent: state.progressPercent,
        completedLessons: state.completedLessons,
        totalLessons: state.totalLessons,
        timeSpentSeconds: state.timeSpentSeconds,
        completedAt: state.completedAt,
      };
    } catch {
      return {
        courseId: e.courseId,
        courseTitle: course?.title ?? e.courseId,
        percent: 0,
        completedLessons: 0,
        totalLessons: 0,
        timeSpentSeconds: 0,
        completedAt: null,
      };
    }
  });

  const attempts = listAttemptsForStudent(studentId).filter((a) =>
    ["submitted", "graded", "expired"].includes(a.status),
  );
  const scored = attempts.filter((a) => typeof a.percent === "number");
  const averageQuizScore =
    scored.length === 0
      ? 0
      : Math.round(
          (scored.reduce((s, a) => s + (a.percent ?? 0), 0) / scored.length) * 10,
        ) / 10;
  const quizPassRate =
    scored.length === 0
      ? 0
      : Math.round((scored.filter((a) => a.passed).length / scored.length) * 1000) / 10;

  let attendanceRate = 0;
  let liveClassParticipation = 0;
  try {
    const attendance = getAttendanceOverview();
    attendanceRate = attendance.rate ?? 0;
    liveClassParticipation = attendance.records ?? 0;
  } catch {
    attendanceRate = 0;
  }

  const certificatesIssued = listCertificates({
    studentId,
    status: "issued",
  }).length;

  return {
    studentId,
    overallPercent: overall.progressPercent,
    activeCourses: overall.activeCourses,
    completedCourses: overall.completedCourses,
    learningHours: overall.learningHours,
    lessonsCompleted: overall.lessonsCompleted,
    lessonsStarted: overall.lessonsStarted,
    studyStreakDays: studyStreakDays(studentId),
    attendanceRate,
    averageQuizScore,
    quizAttempts: attempts.length,
    quizPassRate,
    liveClassParticipation,
    certificatesIssued,
    courseProgress,
  };
}

export function getAcademicPerformance(studentId: string): AcademicPerformance {
  const snap = getStudentProgressSnapshot(studentId);
  const attempts = listAttemptsForStudent(studentId).filter(
    (a) => typeof a.percent === "number",
  );
  const percents = attempts.map((a) => a.percent as number);
  return {
    studentId,
    averageScore: snap.averageQuizScore,
    highestScore: percents.length ? Math.max(...percents) : 0,
    lowestScore: percents.length ? Math.min(...percents) : 0,
    passRate: snap.quizPassRate,
    attendanceRate: snap.attendanceRate,
    completionRate:
      snap.activeCourses + snap.completedCourses === 0
        ? 0
        : Math.round(
            (snap.completedCourses / (snap.activeCourses + snap.completedCourses)) * 1000,
          ) / 10,
    studyTimeHours: snap.learningHours,
    quizAttempts: snap.quizAttempts,
    liveClassParticipation: snap.liveClassParticipation,
  };
}

export function getProgressTimeline(studentId: string): ProgressTimelineEvent[] {
  ensureLearningSeeded();
  ensureCertificatesSeeded();
  const events: ProgressTimelineEvent[] = [];

  for (const e of listStudentEnrollments(studentId)) {
    events.push({
      id: `enroll-${e.id}`,
      at: e.enrolledAt,
      type: "enrollment",
      title: "Enrolled in course",
      description: getCourseById(e.courseId)?.title ?? e.courseId,
      courseId: e.courseId,
    });
  }

  for (const h of listHistory(studentId, { limit: 100 })) {
    let type: ProgressTimelineEvent["type"] = "activity";
    if (h.type === "course_started") type = "course_started";
    else if (h.type === "lesson_completed") type = "lesson_completed";
    else if (h.type === "lesson_started") type = "activity";
    events.push({
      id: h.id,
      at: h.createdAt,
      type,
      title: h.title,
      description: h.description,
      courseId: h.courseId,
    });
  }

  for (const a of listAttemptsForStudent(studentId)) {
    if (a.passed) {
      events.push({
        id: `quiz-${a.id}`,
        at: a.submittedAt ?? a.updatedAt,
        type: "quiz_passed",
        title: "Quiz passed",
        description: `Score ${a.percent ?? 0}%`,
        courseId: null,
      });
    }
  }

  for (const c of listCertificates({ studentId, status: "issued" })) {
    events.push({
      id: `cert-${c.id}`,
      at: c.issueDate ? `${c.issueDate}T12:00:00.000Z` : c.createdAt,
      type: "certificate_issued",
      title: "Certificate issued",
      description: `${c.courseName} · ${c.certificateNumber}`,
      courseId: c.courseId,
    });
  }

  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 80);
}

export function listActiveStudents(): Array<{ id: string; name: string; email: string }> {
  return readAuthDb()
    .users.filter((u) => u.role === ROLES.STUDENT && u.status === "active")
    .map((u) => {
      const p = toUserProfile(u);
      return { id: p.id, name: p.fullName || p.email, email: p.email };
    });
}
