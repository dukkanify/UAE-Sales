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
import type { SeriesPoint } from "@/components/dashboard/charts";
import type { CalendarEvent } from "@/components/dashboard/calendar-widget";
import type { ActivityItem } from "@/components/dashboard/recent-activity";
import { format, addDays } from "date-fns";

export { ensureDemoUsersSeeded };

function countByRole(users: StoredUser[], role: Role): number {
  return users.filter((u) => u.role === role).length;
}

export function getPlatformOverview() {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const db = readAuthDb();
  const students = countByRole(db.users, ROLES.STUDENT);
  const instructors = countByRole(db.users, ROLES.INSTRUCTOR);
  const admins = countByRole(db.users, ROLES.ADMIN) + countByRole(db.users, ROLES.SUPER_ADMIN);
  const courseStats = getCourseStats();

  return {
    totalStudents: students,
    totalInstructors: instructors,
    totalAdmins: admins,
    totalUsers: db.users.length,
    totalCourses: courseStats.totalCourses,
    publishedCourses: courseStats.publishedCourses,
    draftCourses: courseStats.draftCourses,
    activeCourseStudents: courseStats.activeStudents,
    activeClasses: 5,
    monthlyRevenue: 28450,
    instructorWalletBalance: 12680,
    pendingPayments: 3,
    platformGrowth: 18.4,
    pendingApprovals: db.users.filter((u) => u.status === ACCOUNT_STATUS.PENDING).length,
    communityReports: 2,
    blogActivity: 8,
    liveClasses: 3,
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

export function getDashboardCalendarEvents(): CalendarEvent[] {
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
    {
      id: "3",
      title: "Quiz: Meteorology",
      date: format(addDays(today, 2), "yyyy-MM-dd"),
      time: "11:00",
      type: "Quiz",
    },
    {
      id: "4",
      title: "CPL Navigation",
      date: format(addDays(today, 3), "yyyy-MM-dd"),
      time: "10:30",
      type: "Class",
    },
    {
      id: "5",
      title: "Office Hours",
      date: format(addDays(today, 5), "yyyy-MM-dd"),
      time: "16:00",
      type: "Session",
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
  // Count courses where seeded instructors are assigned — approximate via stats
  const mine = listCoursesForMetrics({ role: "instructor" });
  return {
    myCourses: mine,
    todaysClasses: 2,
    upcomingClasses: 5,
    students: overview.totalStudents,
    assignments: 7,
    quizzes: 3,
    earnings: 2400,
    walletBalance: 1850,
  };
}

export function getStudentOverview() {
  ensureCoursesSeeded();
  const enrolled = listCoursesForMetrics({ role: "student" });
  return {
    currentCourses: enrolled,
    nextLiveClass: "IR Briefing · Tomorrow 14:00",
    progress: 68,
    certificates: 1,
    notifications: 4,
    assignments: 2,
    quizzes: 1,
    weeklyProgress: 42,
    attendance: 91,
    learningHours: 28,
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
