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
import type { SeriesPoint } from "@/components/dashboard/charts";
import type { CalendarEvent } from "@/components/dashboard/calendar-widget";
import type { ActivityItem } from "@/components/dashboard/recent-activity";
import { format, addDays } from "date-fns";
import { getCalendarEventsForUser } from "@/services/classes/calendar-service";
import { ensureLearningSeeded } from "@/services/learning/seed";
import { getLearningDashboard } from "@/services/learning/learning-service";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { listCertificates } from "@/services/certificates/certificate-service";
import type { UserProfile } from "@/types";

export { ensureDemoUsersSeeded };

function countByRole(users: StoredUser[], role: Role): number {
  return users.filter((u) => u.role === role).length;
}

export function getPlatformOverview() {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  ensureClassesSeeded();
  const db = readAuthDb();
  const students = countByRole(db.users, ROLES.STUDENT);
  const instructors = countByRole(db.users, ROLES.INSTRUCTOR);
  const admins = countByRole(db.users, ROLES.ADMIN) + countByRole(db.users, ROLES.SUPER_ADMIN);
  const courseStats = getCourseStats();
  const classStats = getClassStats();

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
    monthlyRevenue: 28450,
    instructorWalletBalance: 12680,
    pendingPayments: 3,
    platformGrowth: 18.4,
    pendingApprovals: db.users.filter((u) => u.status === ACCOUNT_STATUS.PENDING).length,
    communityReports: 2,
    blogActivity: 8,
    liveClasses: classStats.liveNow,
    activeSessions: db.sessions.filter((s) => !s.revokedAt).length,
  };
}

export function getGrowthSeries(): SeriesPoint[] {
  return [
    { name: "Jan", value: 42 },
    { name: "Feb", value: 58 },
    { name: "Mar", value: 71 },
    { name: "Apr", value: 88 },
    { name: "May", value: 102 },
    { name: "Jun", value: 126 },
    { name: "Jul", value: 148 },
  ];
}

export function getRevenueSeries(): SeriesPoint[] {
  return [
    { name: "Jan", value: 8200 },
    { name: "Feb", value: 9100 },
    { name: "Mar", value: 12400 },
    { name: "Apr", value: 15200 },
    { name: "May", value: 18900 },
    { name: "Jun", value: 22100 },
    { name: "Jul", value: 28450 },
  ];
}

export function getEnrollmentSeries(): SeriesPoint[] {
  return [
    { name: "PPL", value: 48 },
    { name: "CPL", value: 32 },
    { name: "IR", value: 21 },
    { name: "ATPL", value: 14 },
    { name: "ME", value: 19 },
  ];
}

export function getAttendanceSeries(): SeriesPoint[] {
  return [
    { name: "Mon", value: 92 },
    { name: "Tue", value: 88 },
    { name: "Wed", value: 95 },
    { name: "Thu", value: 90 },
    { name: "Fri", value: 86 },
    { name: "Sat", value: 78 },
  ];
}

export function getEarningsSeries(): SeriesPoint[] {
  return [
    { name: "Jan", value: 1200 },
    { name: "Feb", value: 1450 },
    { name: "Mar", value: 1600 },
    { name: "Apr", value: 2100 },
    { name: "May", value: 1980 },
    { name: "Jun", value: 2400 },
  ];
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

export function getInstructorOverview() {
  const overview = getPlatformOverview();
  ensureCoursesSeeded();
  ensureClassesSeeded();
  const mine = listCoursesForMetrics({ role: "instructor" });
  const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR);
  const classStats = getClassStats(instructor?.id);
  return {
    myCourses: mine,
    todaysClasses: classStats.today,
    upcomingClasses: classStats.upcoming,
    students: overview.totalStudents,
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

function listCoursesForMetrics(opts: { role: "instructor" | "student" }): number {
  const db = readCoursesDb();
  const users = readAuthDb().users;
  if (opts.role === "instructor") {
    const instructor = users.find((u) => u.role === ROLES.INSTRUCTOR);
    if (!instructor) return 0;
    const ids = new Set(
      db.instructors.filter((i) => i.userId === instructor.id).map((i) => i.courseId),
    );
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
