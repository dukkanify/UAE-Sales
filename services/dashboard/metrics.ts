/**
 * Dashboard metrics — real user counts from auth store + foundation placeholders
 * for courses/classes/revenue (business modules not yet implemented).
 */

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb, toUserProfile, type StoredUser } from "@/services/auth/store";
import { ROLES, type Role } from "@/constants/roles";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { getCourseStats } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import { getClassStats } from "@/services/classes/class-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
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
import { buildExecutiveAnalytics } from "@/services/analytics/aggregator";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import { listInstructorStudents } from "@/services/courses/instructor-students";
import type { UserProfile } from "@/types";

export { ensureDemoUsersSeeded };

function countByRole(users: StoredUser[], role: Role): number {
  return users.filter((u) => u.role === role).length;
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
    communityReports: 2,
    blogActivity: 8,
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

export function getEnrollmentSeries(): SeriesPoint[] {
  ensureCoursesSeeded();
  const exec = buildExecutiveAnalytics();
  const bars = exec.charts.find((c) => c.id === "enrollment_mix");
  if (bars?.points.length) return bars.points.map((p) => ({ name: p.name, value: p.value }));
  return [
    { name: "PPL", value: 0 },
    { name: "CPL", value: 0 },
    { name: "ATPL", value: 0 },
  ];
}

export function getAttendanceSeries(): SeriesPoint[] {
  ensureClassesSeeded();
  const rate = getClassStats().attendanceRate;
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

export function getProgressBreakdown(): { name: string; value: number }[] {
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

export function getRecentActivityFeed(): ActivityItem[] {
  ensureDemoUsersSeeded();
  const db = readAuthDb();
  return db.activityLogs.slice(0, 8).map((log) => ({
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
  const overview = getPlatformOverview();
  ensureCoursesSeeded();
  ensureClassesSeeded();
  const users = readAuthDb().users;
  const instructor =
    (instructorUserId ? users.find((u) => u.id === instructorUserId) : null) ??
    users.find((u) => u.role === ROLES.INSTRUCTOR);
  const mine = listCoursesForMetrics({
    role: "instructor",
    instructorId: instructor?.id ?? null,
  });
  const classStats = getClassStats(instructor?.id);
  const students = instructor?.id
    ? listInstructorStudents(instructor.id).reduce((set, row) => {
        set.add(row.studentId);
        return set;
      }, new Set<string>()).size
    : overview.totalStudents;
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

export function getStudentOverview() {
  ensureCoursesSeeded();
  ensureLearningSeeded();
  const student = readAuthDb().users.find(
    (u) => u.role === ROLES.STUDENT && u.status === ACCOUNT_STATUS.ACTIVE,
  );
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
      attendance: 91,
      learningHours: learning.learningHours,
    };
  }
  const enrolled = listCoursesForMetrics({ role: "student" });
  return {
    currentCourses: enrolled,
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
  const overview = getPlatformOverview();
  return {
    students: overview.totalStudents,
    instructors: overview.totalInstructors,
    courses: overview.totalCourses,
    liveClasses: overview.liveClasses,
    pendingApprovals: overview.pendingApprovals,
    communityReports: overview.communityReports,
    blogActivity: overview.blogActivity,
  };
}
