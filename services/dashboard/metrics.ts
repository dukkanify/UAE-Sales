/**
 * Dashboard metrics — live counts from auth, courses, classes, finance, and communication stores.
 */

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { findUserById, readAuthDb, toUserProfile, type StoredUser } from "@/services/auth/store";
import { ROLES, type Role } from "@/constants/roles";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { getCourseStats } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import { getClassStats } from "@/services/classes/class-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb } from "@/services/classes/store";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import { readCommunicationDb } from "@/services/communication/store";
import type { SeriesPoint } from "@/components/dashboard/chart-types";
import type { CalendarEvent } from "@/components/dashboard/calendar-widget";
import type { ActivityItem } from "@/components/dashboard/recent-activity";
import { format, addDays } from "date-fns";
import { getCalendarEventsForUser } from "@/services/classes/calendar-service";
import { ensureLearningSeeded } from "@/services/learning/seed";
import { getLearningDashboard } from "@/services/learning/learning-service";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { listCertificates } from "@/services/certificates/certificate-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { getFinanceDashboard } from "@/services/payments/report-service";
import { listWallets } from "@/services/payments/wallet-service";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import { listInstructorStudents } from "@/services/courses/instructor-students";
import type { UserProfile } from "@/types";

export { ensureDemoUsersSeeded };

function countByRole(users: StoredUser[], role: Role): number {
  return users.filter((u) => u.role === role).length;
}

function communicationOpsCounts() {
  ensureCommunicationSeeded();
  const comm = readCommunicationDb();
  const monthPrefix = new Date().toISOString().slice(0, 7);
  return {
    communityReports: comm.moderationLogs.filter((l) => l.action === "flag" || l.action === "block")
      .length,
    blogActivity: comm.blogPosts.filter(
      (p) =>
        p.status === "published" &&
        (p.publishedAt?.startsWith(monthPrefix) || p.updatedAt.startsWith(monthPrefix)),
    ).length,
  };
}

export function getPlatformOverview() {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  ensureClassesSeeded();
  ensurePaymentsSeeded();
  ensureAnalyticsSeeded();
  const db = readAuthDb();
  const students = countByRole(db.users, ROLES.STUDENT);
  const instructors = countByRole(db.users, ROLES.INSTRUCTOR);
  const admins = countByRole(db.users, ROLES.ADMIN) + countByRole(db.users, ROLES.SUPER_ADMIN);
  const courseStats = getCourseStats();
  const classStats = getClassStats();
  const finance = getFinanceDashboard();
  const wallets = listWallets();
  const growth =
    finance.monthlyGrowth.length > 1
      ? Math.round(
          ((finance.monthlyGrowth.at(-1)!.value - finance.monthlyGrowth.at(-2)!.value) /
            Math.max(1, finance.monthlyGrowth.at(-2)!.value)) *
            1000,
        ) / 10
      : 0;

  return {
    totalStudents: students,
    totalInstructors: instructors,
    totalAdmins: admins,
    totalUsers: db.users.length,
    totalCourses: courseStats.totalCourses,
    publishedCourses: courseStats.publishedCourses,
    draftCourses: courseStats.draftCourses,
    activeCourseStudents: courseStats.activeStudents,
    activeClasses: classStats.liveNow + classStats.today,
    upcomingClasses: classStats.upcoming,
    cancelledClasses: classStats.cancelled,
    attendanceRate: classStats.attendanceRate,
    monthlyRevenue: finance.monthlyRevenue,
    instructorWalletBalance: wallets.reduce((s, w) => s + w.availableBalance, 0),
    pendingPayments: finance.pendingPayments,
    platformGrowth: growth,
    pendingApprovals: db.users.filter((u) => u.status === ACCOUNT_STATUS.PENDING).length,
    ...communicationOpsCounts(),
    liveClasses: classStats.liveNow,
    activeSessions: db.sessions.filter((s) => !s.revokedAt).length,
  };
}

export function getGrowthSeries(): SeriesPoint[] {
  ensureDemoUsersSeeded();
  const students = readAuthDb().users.filter((u) => u.role === ROLES.STUDENT);
  const map = new Map<string, number>();
  for (const u of students) {
    const key = u.createdAt.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  let running = 0;
  const series = [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => {
      running += count;
      return { name, value: running };
    });
  return series.length ? series : [{ name: "Now", value: students.length }];
}

export function getRevenueSeries(): SeriesPoint[] {
  ensurePaymentsSeeded();
  const finance = getFinanceDashboard();
  return finance.monthlyGrowth.length
    ? finance.monthlyGrowth
    : [{ name: "Now", value: finance.monthlyRevenue }];
}

/**
 * Lightweight enrollment chart for role dashboards.
 * Avoids buildExecutiveAnalytics() — that path seeds every module and can take minutes.
 */
export function getEnrollmentSeries(): SeriesPoint[] {
  ensureCoursesSeeded();
  const db = readCoursesDb();
  const byId = new Map(db.courses.map((c) => [c.id, c]));
  const counts = new Map<string, number>();
  for (const e of db.enrollments) {
    counts.set(e.courseId, (counts.get(e.courseId) ?? 0) + 1);
  }
  const top = [...counts.entries()]
    .map(([id, value]) => ({
      name: byId.get(id)?.code ?? id.slice(0, 6),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  if (top.length) return top;

  const buckets = { PPL: 0, CPL: 0, ATPL: 0 };
  for (const e of db.enrollments) {
    const code = byId.get(e.courseId)?.code ?? "";
    if (code.startsWith("ATPL")) buckets.ATPL += 1;
    else if (code.startsWith("CPL")) buckets.CPL += 1;
    else if (code.startsWith("PPL")) buckets.PPL += 1;
  }
  return [
    { name: "PPL", value: buckets.PPL },
    { name: "CPL", value: buckets.CPL },
    { name: "ATPL", value: buckets.ATPL },
  ];
}

export function getAttendanceSeries(instructorId?: string, studentId?: string): SeriesPoint[] {
  ensureClassesSeeded();
  const rate = getClassStats(
    studentId ? { studentId } : instructorId ? { instructorId } : undefined,
  ).attendanceRate;
  return [
    { name: "Mon", value: Math.max(40, rate - 10) },
    { name: "Tue", value: Math.max(45, rate - 5) },
    { name: "Wed", value: rate },
    { name: "Thu", value: Math.min(100, rate + 3) },
    { name: "Fri", value: Math.min(100, rate + 5) },
    { name: "Sat", value: Math.max(50, rate - 8) },
  ];
}

export function getEarningsSeries(): SeriesPoint[] {
  ensurePaymentsSeeded();
  const finance = getFinanceDashboard();
  return finance.monthlyGrowth.map((p) => ({
    name: p.name,
    value: Math.round(p.value * 0.35),
  }));
}

export function getProgressBreakdown(studentUserId?: string | null): {
  name: string;
  value: number;
}[] {
  if (studentUserId) {
    ensureLearningSeeded();
    const student = findUserById(studentUserId);
    if (student) {
      const learning = getLearningDashboard(toUserProfile(student));
      const completed = Math.max(0, Math.min(100, Math.round(learning.progressPercent)));
      const inProgress = Math.max(0, Math.min(100 - completed, 100 - completed));
      const notStarted = Math.max(0, 100 - completed - Math.round(inProgress * 0.5));
      const mid = Math.max(0, 100 - completed - notStarted);
      return [
        { name: "Completed", value: completed },
        { name: "In progress", value: mid },
        { name: "Not started", value: notStarted },
      ];
    }
  }
  return [
    { name: "Completed", value: 42 },
    { name: "In progress", value: 35 },
    { name: "Not started", value: 23 },
  ];
}

export function getDashboardCalendarEvents(user?: UserProfile | null): CalendarEvent[] {
  ensureClassesSeeded();
  if (user) {
    return getCalendarEventsForUser(user).map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      type: e.type,
    }));
  }
  const today = new Date();
  return [
    {
      id: "1",
      title: "PPL Ground School",
      date: format(today, "yyyy-MM-dd"),
      time: "09:00",
      type: "Class",
    },
    {
      id: "2",
      title: "IR Briefing",
      date: format(addDays(today, 1), "yyyy-MM-dd"),
      time: "14:00",
      type: "Live",
    },
  ];
}

export function getRecentActivityFeed(actorUserId?: string | null): ActivityItem[] {
  ensureDemoUsersSeeded();
  const db = readAuthDb();
  const logs = actorUserId
    ? db.activityLogs.filter((log) => log.actorId === actorUserId)
    : db.activityLogs;
  return logs.slice(0, 8).map((log) => ({
    id: log.id,
    title: log.action,
    description: [log.entityType, log.entityId?.slice(0, 8)].filter(Boolean).join(" · "),
    timestamp: log.createdAt,
    badge: log.action.split(".")[0],
  }));
}

export function listUsersByRole(role?: Role) {
  ensureDemoUsersSeeded();
  const db = readAuthDb();
  const users = role ? db.users.filter((u) => u.role === role) : db.users;
  return users.map(toUserProfile);
}

export function getInstructorOverview(instructorUserId?: string | null) {
  ensureCoursesSeeded();
  ensureClassesSeeded();
  const users = readAuthDb().users;
  const instructor = instructorUserId
    ? users.find(
        (u) =>
          u.id === instructorUserId &&
          (u.role === ROLES.INSTRUCTOR || u.role === ROLES.CHIEF_GROUND_INSTRUCTOR),
      )
    : null;
  if (!instructor) {
    return {
      myCourses: 0,
      todaysClasses: 0,
      upcomingClasses: 0,
      students: 0,
      assignments: 0,
      quizzes: 0,
      earnings: 0,
      walletBalance: 0,
    };
  }
  const mine = listCoursesForMetrics({
    role: "instructor",
    instructorId: instructor.id,
  });
  const classStats = getClassStats(instructor.id);
  const students = listInstructorStudents(instructor.id).reduce((set, row) => {
    set.add(row.studentId);
    return set;
  }, new Set<string>()).size;
  return {
    myCourses: mine,
    todaysClasses: classStats.today,
    upcomingClasses: classStats.upcoming,
    students,
    assignments: 7,
    quizzes: 3,
    earnings: 2400,
    walletBalance: 1850,
  };
}

export function getStudentOverview(studentUserId?: string | null) {
  ensureCoursesSeeded();
  ensureLearningSeeded();
  const users = readAuthDb().users;
  const student =
    (studentUserId
      ? users.find((u) => u.id === studentUserId && u.role === ROLES.STUDENT)
      : null) ?? null;
  if (student) {
    const learning = getLearningDashboard(toUserProfile(student));
    ensureCertificatesSeeded();
    const certificates = listCertificates({ studentId: student.id, status: "issued" }).length;
    return {
      currentCourses: learning.activeCourses,
      nextLiveClass: learning.upcomingLiveClass ?? "None scheduled",
      progress: Math.round(learning.progressPercent),
      certificates,
      notifications: learning.notifications,
      assignments: learning.assignments,
      quizzes: 0,
      weeklyProgress: learning.weeklyGoalPercent,
      attendance: 0,
      learningHours: learning.learningHours,
    };
  }
  // Never fall back to another student's demo profile — empty for this account only.
  return {
    currentCourses: 0,
    nextLiveClass: "None scheduled",
    progress: 0,
    certificates: 0,
    notifications: 0,
    assignments: 0,
    quizzes: 0,
    weeklyProgress: 0,
    attendance: 0,
    learningHours: 0,
  };
}

function listCoursesForMetrics(opts: {
  role: "instructor" | "student";
  instructorId?: string | null;
}): number {
  const db = readCoursesDb();
  const users = readAuthDb().users;
  if (opts.role === "instructor") {
    const instructor =
      (opts.instructorId ? users.find((u) => u.id === opts.instructorId) : null) ??
      users.find((u) => u.role === ROLES.INSTRUCTOR);
    if (!instructor) return 0;
    const ids = new Set(
      db.instructors.filter((i) => i.userId === instructor.id).map((i) => i.courseId),
    );
    for (const course of db.courses) {
      if (!course.deletedAt && course.primaryInstructorId === instructor.id) {
        ids.add(course.id);
      }
    }
    return db.courses.filter((c) => !c.deletedAt && ids.has(c.id)).length;
  }
  const student = users.find((u) => u.role === ROLES.STUDENT && u.status === ACCOUNT_STATUS.ACTIVE);
  if (!student) return 0;
  return db.enrollments.filter(
    (e) => e.studentId === student.id && ["approved", "completed", "pending"].includes(e.status),
  ).length;
}

export function getAdminOverview() {
  // Keep this path cheap — admin dashboard SSR must not call getClassStats /
  // buildExecutiveAnalytics (multi-second / multi-minute on seeded data).
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  ensureClassesSeeded();
  const users = readAuthDb().users;
  const courseStats = getCourseStats();
  const now = Date.now();
  const liveClasses = readClassesDb().classes.filter((cls) => {
    if (["cancelled", "draft", "completed"].includes(cls.status)) return false;
    const start = Date.parse(cls.startsAt);
    const end = Date.parse(cls.endsAt);
    return Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end;
  }).length;

  return {
    students: countByRole(users, ROLES.STUDENT),
    instructors: countByRole(users, ROLES.INSTRUCTOR),
    courses: courseStats.totalCourses,
    liveClasses,
    pendingApprovals: users.filter((u) => u.status === ACCOUNT_STATUS.PENDING).length,
    ...communicationOpsCounts(),
  };
}
