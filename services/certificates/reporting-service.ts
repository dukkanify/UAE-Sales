/**
 * Role-scoped academic / platform reports.
 */

import { ROLES } from "@/constants/roles";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { getCourseStats } from "@/services/courses/course-service";
import { readCoursesDb } from "@/services/courses/store";
import { getClassStats } from "@/services/classes/class-service";
import { getAttendanceOverview } from "@/services/classes/attendance-service";
import { listAttemptsForStudent } from "@/services/quizzes/attempt-service";
import { getOverallProgress } from "@/services/learning/progress-service";
import { listHistory } from "@/services/learning/history-service";
import { listCertificates } from "@/services/certificates/certificate-service";
import {
  getStudentProgressSnapshot,
  listActiveStudents,
} from "@/services/certificates/progress-service";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { ensureLearningSeeded } from "@/services/learning/seed";
import type {
  AdminReportBundle,
  ExecutiveReportBundle,
  InstructorReportBundle,
} from "@/types/certificates";

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function getInstructorReport(instructorId: string): InstructorReportBundle {
  ensureCertificatesSeeded();
  ensureCoursesSeeded();
  ensureQuizzesSeeded();
  ensureLearningSeeded();
  ensureClassesSeeded();

  const db = readCoursesDb();
  const courseIds = new Set(
    db.instructors.filter((i) => i.userId === instructorId).map((i) => i.courseId),
  );
  const studentIds = new Set(
    db.enrollments
      .filter((e) => courseIds.has(e.courseId) && ["approved", "completed", "pending"].includes(e.status))
      .map((e) => e.studentId),
  );

  const studentRows = [...studentIds].map((studentId) => {
    const user = readAuthDb().users.find((u) => u.id === studentId);
    const snap = getStudentProgressSnapshot(studentId);
    const history = listHistory(studentId, { limit: 1 })[0];
    return {
      studentId,
      studentName: user ? toUserProfile(user).fullName || user.email : studentId,
      progressPercent: snap.overallPercent,
      quizAverage: snap.averageQuizScore,
      certificates: snap.certificatesIssued,
      lastActivityAt: history?.createdAt ?? null,
    };
  });

  const attendance = getAttendanceOverview(instructorId);
  const certificatesIssued = listCertificates({ status: "issued" }).filter((c) =>
    c.instructorId === instructorId || (c.courseId ? courseIds.has(c.courseId) : false),
  ).length;

  const avgProgress =
    studentRows.length === 0
      ? 0
      : Math.round(
          (studentRows.reduce((s, r) => s + r.progressPercent, 0) / studentRows.length) * 10,
        ) / 10;
  const avgQuiz =
    studentRows.length === 0
      ? 0
      : Math.round(
          (studentRows.reduce((s, r) => s + r.quizAverage, 0) / studentRows.length) * 10,
        ) / 10;
  const completed = studentRows.filter((r) => r.progressPercent >= 100).length;

  return {
    instructorId,
    studentsTracked: studentRows.length,
    coursesOwned: courseIds.size,
    averageStudentProgress: avgProgress,
    attendanceRate: attendance.rate,
    courseCompletionRate:
      studentRows.length === 0
        ? 0
        : Math.round((completed / studentRows.length) * 1000) / 10,
    quizAverage: avgQuiz,
    certificatesIssued,
    studentRows,
  };
}

export function getAdminReport(): AdminReportBundle {
  ensureCertificatesSeeded();
  ensureCoursesSeeded();
  ensureClassesSeeded();
  ensureQuizzesSeeded();
  ensureLearningSeeded();

  const users = readAuthDb().users;
  const courseStats = getCourseStats();
  const classStats = getClassStats();
  const attendance = getAttendanceOverview();
  const certs = listCertificates();
  const students = listActiveStudents();
  let completionSum = 0;
  for (const s of students) {
    completionSum += getOverallProgress(s.id).progressPercent;
  }

  return {
    students: users.filter((u) => u.role === ROLES.STUDENT).length,
    instructors: users.filter((u) => u.role === ROLES.INSTRUCTOR).length,
    courses: courseStats.totalCourses,
    liveClasses: classStats.upcoming + classStats.liveNow + (classStats.completed ?? 0),

    certificatesIssued: certs.filter((c) => c.status === "issued").length,
    certificatesPending: certs.filter((c) => c.status === "pending_approval").length,
    averageAttendance: attendance.rate,
    averageCompletion:
      students.length === 0 ? 0 : Math.round((completionSum / students.length) * 10) / 10,
    quizPassRate: (() => {
      // Approximate from attempts across students
      let passed = 0;
      let total = 0;
      for (const s of students) {
        const attempts = listAttemptsForStudent(s.id).filter((a) => typeof a.percent === "number");
        total += attempts.length;
        passed += attempts.filter((a) => a.passed).length;
      }
      return total === 0 ? 0 : Math.round((passed / total) * 1000) / 10;
    })(),
    platformActiveUsers: users.filter((u) => u.status === ACCOUNT_STATUS.ACTIVE).length,
  };
}

export function getExecutiveReport(): ExecutiveReportBundle {
  const admin = getAdminReport();
  const students = listActiveStudents();
  const certs = listCertificates({ status: "issued" });
  const instructors = readAuthDb().users.filter((u) => u.role === ROLES.INSTRUCTOR);

  const completionTrendMap = new Map<string, number>();
  const growthMap = new Map<string, { students: number; certificates: number }>();
  for (const s of students) {
    const user = readAuthDb().users.find((u) => u.id === s.id);
    if (user) {
      const m = monthKey(user.createdAt);
      const g = growthMap.get(m) ?? { students: 0, certificates: 0 };
      g.students += 1;
      growthMap.set(m, g);
    }
    const snap = getStudentProgressSnapshot(s.id);
    for (const c of snap.courseProgress) {
      if (c.completedAt) {
        const m = monthKey(c.completedAt);
        completionTrendMap.set(m, (completionTrendMap.get(m) ?? 0) + 1);
      }
    }
  }
  for (const c of certs) {
    const m = monthKey(c.issueDate ?? c.createdAt);
    const g = growthMap.get(m) ?? { students: 0, certificates: 0 };
    g.certificates += 1;
    growthMap.set(m, g);
  }

  const instructorPerformance = instructors.map((inst) => {
    const report = getInstructorReport(inst.id);
    return {
      instructorId: inst.id,
      instructorName: toUserProfile(inst).fullName || inst.email,
      students: report.studentsTracked,
      avgProgress: report.averageStudentProgress,
      certificates: report.certificatesIssued,
    };
  });

  let learningHours = 0;
  let quizAttempts = 0;
  for (const s of students) {
    const snap = getStudentProgressSnapshot(s.id);
    learningHours += snap.learningHours;
    quizAttempts += snap.quizAttempts;
  }

  const attendance = getAttendanceOverview();

  return {
    totalGraduates: students.filter((s) => getOverallProgress(s.id).completedCourses > 0).length,
    certificatesIssued: admin.certificatesIssued,
    activeStudents: students.length,
    completionTrend: [...completionTrendMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, completions]) => ({ month, completions })),
    courseSuccessRate: admin.averageCompletion,
    instructorPerformance,
    monthlyGrowth: [...growthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, students: v.students, certificates: v.certificates })),
    platformEngagement: {
      learningHours: Math.round(learningHours * 10) / 10,
      quizAttempts,
      liveAttendance: attendance.present,
    },
  };
}
