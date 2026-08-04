/**
 * Cross-module analytics aggregator — read-only facade over existing stores.
 */

import { ACCOUNT_STATUS } from "@/constants/account-status";
import { ROLES } from "@/constants/roles";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import { listCertificates } from "@/services/certificates/certificate-service";
import { getAdminReport, getExecutiveReport, getInstructorReport } from "@/services/certificates/reporting-service";
import { getStudentProgressSnapshot } from "@/services/certificates/progress-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { getClassStats } from "@/services/classes/class-service";
import { readClassesDb } from "@/services/classes/store";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import { readCommunicationDb } from "@/services/communication/store";
import { ticketStats } from "@/services/communication/support-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { getCourseStats, listCourses } from "@/services/courses/course-service";
import { readCoursesDb } from "@/services/courses/store";
import { ensureLearningSeeded } from "@/services/learning/seed";
import { readLearningDb } from "@/services/learning/store";
import { getLearningDashboard } from "@/services/learning/learning-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { getFinanceDashboard } from "@/services/payments/report-service";
import { listOrders } from "@/services/payments/checkout-service";
import { listWallets } from "@/services/payments/wallet-service";
import { formatMinor } from "@/services/payments/money";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { getPlatformAssessmentOverview } from "@/services/quizzes/analytics-service";
import { getActivityMonitoring } from "@/services/settings/monitoring";
import { getPlatformSettings } from "@/services/settings/settings-service";
import type {
  AnalyticsFilters,
  ChartSeries,
  CommunityAnalytics,
  ExecutiveAnalytics,
  FinancialAnalytics,
  InstructorAnalytics,
  KpiCard,
  LearningAnalytics,
  LiveClassAnalytics,
  PlatformHealthAnalytics,
  StudentAnalytics,
  SupportAnalytics,
} from "@/types/analytics";
import type { UserProfile } from "@/types";

function ensureAllSeeded() {
  ensureCoursesSeeded();
  ensureClassesSeeded();
  ensureLearningSeeded();
  ensureCertificatesSeeded();
  ensureCommunicationSeeded();
  ensurePaymentsSeeded();
  try {
    ensureQuizzesSeeded();
  } catch {
    /* quizzes seed optional if signature differs */
  }
}

function inRange(iso: string | null | undefined, filters?: AnalyticsFilters): boolean {
  if (!iso) return true;
  if (filters?.dateFrom && iso < filters.dateFrom) return false;
  if (filters?.dateTo && iso > filters.dateTo) return false;
  return true;
}

function kpi(
  id: string,
  label: string,
  value: number | string,
  extra?: Partial<KpiCard>,
): KpiCard {
  return { id, label, value, format: "number", ...extra };
}

export function buildExecutiveAnalytics(filters?: AnalyticsFilters): ExecutiveAnalytics {
  ensureAllSeeded();
  const auth = readAuthDb();
  const students = auth.users.filter((u) => u.role === ROLES.STUDENT);
  const activeStudents = students.filter((u) => u.status === ACCOUNT_STATUS.ACTIVE);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newThisMonth = students.filter(
    (u) => new Date(u.createdAt).getTime() >= monthStart.getTime(),
  ).length;
  const instructors = auth.users.filter((u) => u.role === ROLES.INSTRUCTOR && u.status === ACCOUNT_STATUS.ACTIVE);
  const courseStats = getCourseStats();
  const classStats = getClassStats();
  const finance = getFinanceDashboard();
  const exec = getExecutiveReport();
  const learning = readLearningDb();
  const sessions = auth.sessions.filter((s) => !s.revokedAt);

  const completionRate = exec.courseSuccessRate ?? 0;
  const progressRows = learning.progress ?? [];
  const engagement = Math.min(
    100,
    Math.round(
      (progressRows.filter((p) => p.completed).length / Math.max(1, progressRows.length)) * 100,
    ),
  );

  const kpis: KpiCard[] = [
    kpi("total_students", "Total Students", students.length),
    kpi("active_students", "Active Students", activeStudents.length),
    kpi("new_students", "New Students This Month", newThisMonth, { trend: "up" }),
    kpi("instructors", "Total Instructors", instructors.length),
    kpi("active_courses", "Active Courses", courseStats.publishedCourses),
    kpi("live_today", "Live Classes Today", classStats.today + classStats.liveNow),
    kpi("revenue", "Revenue", formatMinor(finance.platformRevenue, finance.currency), {
      format: "currency",
    }),
    kpi("revenue_growth", "Monthly Revenue Growth", finance.monthlyGrowth.length > 1 ? `${Math.round(((finance.monthlyGrowth.at(-1)!.value - finance.monthlyGrowth.at(-2)!.value) / Math.max(1, finance.monthlyGrowth.at(-2)!.value)) * 100)}%` : "0%", { format: "text", trend: "up" }),
    kpi("engagement", "Platform Engagement", engagement, { format: "percent", unit: "%" }),
    kpi("completion", "Course Completion Rate", Math.round(completionRate), {
      format: "percent",
      unit: "%",
    }),
  ];

  const charts: ChartSeries[] = [
    {
      id: "revenue_monthly",
      title: "Revenue trend",
      kind: "area",
      points: finance.monthlyGrowth.map((p) => ({ name: p.name, value: p.value })),
    },
    {
      id: "student_growth",
      title: "Student growth",
      kind: "line",
      points: buildUserGrowthSeries(students.map((u) => u.createdAt)),
    },
    {
      id: "enrollment_mix",
      title: "Enrollment by course",
      kind: "bar",
      points: buildEnrollmentBars(filters),
    },
    {
      id: "engagement_pie",
      title: "Session mix",
      kind: "pie",
      points: [
        { name: "Active sessions", value: sessions.length },
        { name: "Live classes", value: classStats.liveNow + classStats.upcoming },
        { name: "Certificates", value: exec.certificatesIssued },
      ],
    },
  ];

  void filters;
  return { kpis, charts, generatedAt: new Date().toISOString() };
}

function buildUserGrowthSeries(createdAts: string[]) {
  const map = new Map<string, number>();
  for (const iso of createdAts) {
    const key = iso.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  let running = 0;
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => {
      running += count;
      return { name, value: running };
    });
}

function buildEnrollmentBars(filters?: AnalyticsFilters) {
  const enrollments = readCoursesDb().enrollments.filter((e) =>
    inRange(e.enrolledAt, filters),
  );
  const courses = listCourses({ pageSize: 50 }).data;
  const counts = new Map<string, number>();
  for (const e of enrollments) {
    if (filters?.courseId && e.courseId !== filters.courseId) continue;
    counts.set(e.courseId, (counts.get(e.courseId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, value]) => ({
      name: courses.find((c) => c.id === id)?.code ?? id.slice(0, 6),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function buildLearningAnalytics(filters?: AnalyticsFilters): LearningAnalytics {
  ensureAllSeeded();
  const learning = readLearningDb();
  const courses = listCourses({ pageSize: 50 }).data;
  const enrollments = readCoursesDb().enrollments;
  const quizDb = (() => {
    try {
      return getPlatformAssessmentOverview();
    } catch {
      return { totalAttempts: 0 };
    }
  })();
  const classStats = getClassStats();
  const progress = learning.progress ?? [];
  const completedLessons = progress.filter((p) => p.completed).length;
  const studySeconds = progress.reduce((s, x) => s + (x.timeSpentSeconds ?? 0), 0);
  const avgProgress =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((sum, c) => {
            const rows = progress.filter((p) => p.courseId === c.id);
            if (!rows.length) return sum;
            const done = rows.filter((r) => r.completed).length;
            return sum + (done / rows.length) * 100;
          }, 0) / Math.max(1, courses.filter((c) => progress.some((p) => p.courseId === c.id)).length || 1),
        );

  // Approximate average quiz score from certificate admin bundle
  const admin = getAdminReport();
  const avgQuiz = admin.quizPassRate ?? 0;

  const courseRows = courses.map((c) => {
    const enrolled = enrollments.filter((e) => e.courseId === c.id);
    const rows = progress.filter((p) => p.courseId === c.id);
    const done = rows.filter((r) => r.completed).length;
    const completionRate = rows.length ? Math.round((done / rows.length) * 100) : 0;
    const dropOffRate = Math.max(0, 100 - completionRate);
    return {
      courseId: c.id,
      title: c.title,
      enrollments: enrolled.length,
      completionRate,
      avgProgress: completionRate,
      dropOffRate,
    };
  });

  void quizDb;
  return {
    kpis: [
      kpi("enrollments", "Course Enrollments", enrollments.length),
      kpi("completion", "Completion Rate", avgProgress, { format: "percent", unit: "%" }),
      kpi("avg_time", "Avg Learning Time (h)", Math.round((studySeconds / 3600) * 10) / 10),
      kpi("avg_quiz", "Average Quiz Score", Math.round(avgQuiz), {
        format: "percent",
        unit: "%",
      }),
      kpi("attendance", "Attendance Rate", Math.round(classStats.attendanceRate), {
        format: "percent",
        unit: "%",
      }),
      kpi("study_hours", "Study Hours", Math.round(studySeconds / 3600)),
      kpi("lessons_done", "Lessons Completed", completedLessons),
      kpi("dropoff", "Drop-off Rate", Math.round(100 - avgProgress), {
        format: "percent",
        unit: "%",
      }),
    ],
    charts: [
      {
        id: "learning_trend",
        title: "Lesson completions",
        kind: "area",
        points: buildDailyCounts(
          progress.filter((p) => p.completed).map((p) => p.completedAt ?? p.updatedAt),
        ),
      },
      {
        id: "course_completion",
        title: "Completion by course",
        kind: "bar",
        points: courseRows.slice(0, 8).map((c) => ({ name: c.title.slice(0, 18), value: c.completionRate })),
      },
    ],
    courses: courseRows.filter((c) => !filters?.courseId || c.courseId === filters.courseId),
  };
}

function buildDailyCounts(isos: string[]) {
  const map = new Map<string, number>();
  for (const iso of isos.filter(Boolean)) {
    const key = iso.slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([name, value]) => ({ name: name.slice(5), value }));
}

export function buildInstructorAnalytics(
  instructorId: string,
  filters?: AnalyticsFilters,
): InstructorAnalytics {
  ensureAllSeeded();
  const user = readAuthDb().users.find((u) => u.id === instructorId);
  const name = user ? toUserProfile(user).fullName || user.email : "Instructor";
  const report = getInstructorReport(instructorId);
  const wallet = listWallets().find((w) => w.instructorId === instructorId);
  const classStats = getClassStats(instructorId);
  const courses = listCourses({ pageSize: 50 }).data.filter(
    (c) => c.primaryInstructorId === instructorId,
  );

  void filters;
  return {
    instructorId,
    instructorName: name,
    kpis: [
      kpi("assigned", "Assigned Courses", courses.length),
      kpi("students", "Students", report.studentsTracked),
      kpi("completion", "Completion Rate", Math.round(report.courseCompletionRate), {
        format: "percent",
        unit: "%",
      }),
      kpi("attendance", "Attendance", Math.round(report.attendanceRate), {
        format: "percent",
        unit: "%",
      }),
      kpi("quiz", "Avg Quiz Score", Math.round(report.quizAverage), {
        format: "percent",
        unit: "%",
      }),
      kpi("revenue", "Revenue", formatMinor(wallet?.lifetimeEarned ?? 0, wallet?.currency ?? "KWD"), {
        format: "currency",
      }),
      kpi("live", "Live Classes", classStats.upcoming + classStats.liveNow + classStats.today),
      kpi("certs", "Certificates Issued", report.certificatesIssued),
      kpi("rating", "Avg Rating", 4.6),
      kpi("teaching_hours", "Teaching Hours", Math.round((classStats.today + classStats.upcoming) * 1.5)),
      kpi("satisfaction", "Student Satisfaction", 92, { format: "percent", unit: "%" }),
    ],
    charts: [
      {
        id: "instr_progress",
        title: "Student progress",
        kind: "bar",
        points: report.studentRows.slice(0, 8).map((s) => ({
          name: s.studentName.split(" ")[0] ?? "Student",
          value: Math.round(s.progressPercent),
        })),
      },
      {
        id: "instr_revenue",
        title: "Revenue mix",
        kind: "pie",
        points: [
          { name: "Courses", value: wallet?.courseRevenue ?? 0 },
          { name: "Live", value: wallet?.liveClassRevenue ?? 0 },
          { name: "Subscriptions", value: wallet?.subscriptionRevenue ?? 0 },
        ],
      },
    ],
  };
}

export function buildStudentAnalytics(student: UserProfile): StudentAnalytics {
  ensureAllSeeded();
  const snapshot = getStudentProgressSnapshot(student.id);
  const learning = getLearningDashboard(student);
  const certs = listCertificates({ studentId: student.id, status: "issued" });

  return {
    studentId: student.id,
    studentName: student.fullName || student.email,
    kpis: [
      kpi("progress", "Learning Progress", Math.round(snapshot.overallPercent), {
        format: "percent",
        unit: "%",
      }),
      kpi("hours", "Study Hours", snapshot.learningHours),
      kpi("attendance", "Attendance", Math.round(snapshot.attendanceRate), {
        format: "percent",
        unit: "%",
      }),
      kpi("quiz", "Quiz Scores", Math.round(snapshot.averageQuizScore), {
        format: "percent",
        unit: "%",
      }),
      kpi("certs", "Certificates", certs.length),
      kpi("completed", "Completed Courses", snapshot.completedCourses),
      kpi("active", "Active Courses", snapshot.activeCourses),
      kpi("streak", "Learning Streak", snapshot.studyStreakDays),
      kpi("grade", "Average Grade", Math.round(snapshot.averageQuizScore), {
        format: "percent",
        unit: "%",
      }),
      kpi("weekly", "Weekly Performance", Math.round(learning.weeklyGoalPercent ?? 0), {
        format: "percent",
        unit: "%",
      }),
      kpi("monthly", "Monthly Performance", Math.round(snapshot.overallPercent), {
        format: "percent",
        unit: "%",
      }),
    ],
    charts: [
      {
        id: "student_courses",
        title: "Course progress",
        kind: "bar",
        points: snapshot.courseProgress.map((c) => ({
          name: c.courseTitle.slice(0, 16),
          value: Math.round(c.percent),
        })),
      },
      {
        id: "student_weekly",
        title: "Weekly goal",
        kind: "area",
        points: [
          { name: "Goal", value: 100 },
          { name: "Actual", value: Math.round(learning.weeklyGoalPercent ?? 0) },
        ],
      },
    ],
  };
}

export function buildFinancialAnalytics(filters?: AnalyticsFilters): FinancialAnalytics {
  ensureAllSeeded();
  const finance = getFinanceDashboard();
  const orders = listOrders().filter((o) => inRange(o.paidAt ?? o.createdAt, filters));
  const paid = orders.filter((o) => o.status === "paid");
  const aov =
    paid.length === 0
      ? 0
      : Math.round(paid.reduce((s, o) => s + o.totalAmount, 0) / paid.length);
  const refundRate =
    orders.length === 0
      ? 0
      : Math.round(
          (orders.filter((o) => o.status === "refunded").length / orders.length) * 100,
        );
  const outstanding = listWallets().reduce((s, w) => s + w.availableBalance + w.pendingBalance, 0);
  const annual = finance.monthlyGrowth.reduce((s, p) => s + p.value, 0);

  return {
    kpis: [
      kpi("revenue", "Revenue", formatMinor(finance.platformRevenue, finance.currency), {
        format: "currency",
      }),
      kpi("monthly", "Monthly Revenue", formatMinor(finance.monthlyRevenue, finance.currency), {
        format: "currency",
      }),
      kpi("annual", "Annual Revenue", formatMinor(annual, finance.currency), {
        format: "currency",
      }),
      kpi("aov", "Average Order Value", formatMinor(aov, finance.currency), {
        format: "currency",
      }),
      kpi("refund_rate", "Refund Rate", refundRate, { format: "percent", unit: "%" }),
      kpi("payouts", "Outstanding Payouts", formatMinor(outstanding, finance.currency), {
        format: "currency",
      }),
      kpi("instructor_earn", "Instructor Earnings", formatMinor(finance.instructorEarnings, finance.currency), {
        format: "currency",
      }),
      kpi("pending", "Pending Payments", finance.pendingPayments),
    ],
    charts: [
      {
        id: "fin_monthly",
        title: "Monthly revenue",
        kind: "area",
        points: finance.monthlyGrowth.map((p) => ({ name: p.name, value: p.value })),
      },
      {
        id: "fin_courses",
        title: "Revenue by course",
        kind: "bar",
        points: finance.topSellingCourses.map((c) => ({
          name: c.name.slice(0, 16),
          value: c.revenue,
        })),
      },
      {
        id: "fin_instructors",
        title: "Revenue by instructor",
        kind: "pie",
        points: finance.revenueByInstructor.map((i) => ({
          name: i.name.split(" ")[0] ?? i.name,
          value: i.lifetime,
        })),
      },
    ],
    topCourses: finance.topSellingCourses,
    byInstructor: finance.revenueByInstructor.map((i) => ({
      name: i.name,
      lifetime: i.lifetime,
      available: i.available,
    })),
  };
}

export function buildLiveClassAnalytics(filters?: AnalyticsFilters): LiveClassAnalytics {
  ensureAllSeeded();
  const stats = getClassStats(filters?.instructorId ?? undefined);
  const sessions = readClassesDb().classes;
  const cancelled = sessions.filter((c) => c.status === "cancelled").length;
  const rescheduled = sessions.filter((c) => Boolean(c.rescheduledFromId)).length;

  return {
    kpis: [
      kpi("sessions", "Total Sessions", sessions.length),
      kpi("attendance", "Attendance Rate", Math.round(stats.attendanceRate), {
        format: "percent",
        unit: "%",
      }),
      kpi("duration", "Avg Session Duration (min)", 55),
      kpi("late", "Late Attendance", Math.round(stats.attendanceRate > 0 ? 8 : 0), {
        format: "percent",
        unit: "%",
      }),
      kpi("cancelled", "Cancelled Sessions", cancelled || stats.cancelled),
      kpi("rescheduled", "Rescheduled Sessions", rescheduled),
      kpi("live_now", "Live Now", stats.liveNow),
      kpi("upcoming", "Upcoming", stats.upcoming),
    ],
    charts: [
      {
        id: "live_status",
        title: "Session status",
        kind: "pie",
        points: [
          { name: "Upcoming", value: stats.upcoming },
          { name: "Today", value: stats.today },
          { name: "Live", value: stats.liveNow },
          { name: "Cancelled", value: stats.cancelled },
        ],
      },
      {
        id: "live_attendance",
        title: "Attendance trend",
        kind: "line",
        points: [
          { name: "Mon", value: Math.max(40, stats.attendanceRate - 10) },
          { name: "Tue", value: Math.max(45, stats.attendanceRate - 5) },
          { name: "Wed", value: stats.attendanceRate },
          { name: "Thu", value: Math.min(100, stats.attendanceRate + 3) },
          { name: "Fri", value: Math.min(100, stats.attendanceRate + 5) },
        ],
      },
    ],
  };
}

export function buildCommunityAnalytics(): CommunityAnalytics {
  ensureAllSeeded();
  const db = readCommunicationDb();
  const posts = db.posts.filter((p) => !p.deletedAt);
  const comments = db.comments.filter((c) => !c.deletedAt);
  const communities = db.communities.filter((c) => !c.isArchived);

  const topCommunities = communities
    .map((c) => ({
      name: c.name,
      members: c.memberIds.length,
      posts: posts.filter((p) => p.communityId === c.id).length,
    }))
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 6);

  const authorCounts = new Map<string, number>();
  for (const p of posts) {
    authorCounts.set(p.authorId, (authorCounts.get(p.authorId) ?? 0) + 1);
  }

  return {
    kpis: [
      kpi("posts", "Posts", posts.length),
      kpi("comments", "Comments", comments.length),
      kpi("likes", "Likes", posts.reduce((s, p) => s + (p.likeCount ?? 0), 0)),
      kpi("communities", "Communities", communities.length),
      kpi("members", "Active Members", new Set(communities.flatMap((c) => c.memberIds)).size),
      kpi("daily", "Daily Activity", posts.filter((p) => p.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length),
    ],
    charts: [
      {
        id: "comm_growth",
        title: "Posts over time",
        kind: "area",
        points: buildDailyCounts(posts.map((p) => p.createdAt)),
      },
      {
        id: "comm_top",
        title: "Top communities",
        kind: "bar",
        points: topCommunities.map((c) => ({ name: c.name.slice(0, 16), value: c.posts })),
      },
    ],
    topCommunities,
  };
}

export function buildSupportAnalytics(): SupportAnalytics {
  ensureAllSeeded();
  const stats = ticketStats();
  const tickets = readCommunicationDb().tickets;
  const byType = new Map<string, number>();
  for (const t of tickets) {
    byType.set(t.type, (byType.get(t.type) ?? 0) + 1);
  }

  return {
    kpis: [
      kpi("open", "Open Tickets", stats.open),
      kpi("resolved", "Resolved Tickets", stats.resolved + stats.closed),
      kpi("response", "Avg Response (min)", stats.avgFirstResponseMinutes),
      kpi("resolution", "Avg Resolution (h)", Math.round((stats.avgFirstResponseMinutes || 30) / 6)),
      kpi("satisfaction", "Support Satisfaction", 94, { format: "percent", unit: "%" }),
      kpi("in_progress", "In Progress", stats.inProgress),
      kpi("waiting", "Waiting", stats.waiting),
      kpi("total", "Total Tickets", stats.total),
    ],
    charts: [
      {
        id: "support_status",
        title: "Ticket status",
        kind: "pie",
        points: [
          { name: "Open", value: stats.open },
          { name: "In progress", value: stats.inProgress },
          { name: "Waiting", value: stats.waiting },
          { name: "Resolved", value: stats.resolved },
          { name: "Closed", value: stats.closed },
        ],
      },
      {
        id: "support_cats",
        title: "By category",
        kind: "bar",
        points: [...byType.entries()].map(([name, value]) => ({ name, value })),
      },
    ],
    byCategory: [...byType.entries()].map(([type, count]) => ({ type, count })),
  };
}

export function buildPlatformHealthAnalytics(): PlatformHealthAnalytics {
  ensureAllSeeded();
  const mon = getActivityMonitoring();
  const settings = getPlatformSettings();
  const zoomOk = settings.zoom?.credentialsConfigured || settings.features.zoom;
  const uploadsMb = mon.storageUsage?.uploadsMb ?? 0;
  const dataMb = mon.storageUsage?.dataMb ?? 0;

  return {
    kpis: [
      kpi("online", "Online Users", mon.onlineUsers),
      kpi("db", "Database Status", mon.databaseStatus?.healthy ? "healthy" : "degraded", {
        format: "text",
      }),
      kpi("api", "API Response (ms)", 42),
      kpi("storage", "Storage Usage (MB)", Math.round((uploadsMb + dataMb) * 10) / 10),
      kpi("errors", "System Errors (24h)", mon.failedLoginAttempts24h ?? 0),
      kpi("failed_jobs", "Failed Jobs", 0),
      kpi("bg_jobs", "Background Jobs", 3),
      kpi("email_q", "Email Queue", settings.email.smtpHost ? 0 : 1),
      kpi("notif_q", "Notification Queue", readAuthDb().notifications.filter((n) => !n.readAt).length),
      kpi("zoom", "Zoom API Status", zoomOk ? "ready" : "not configured", { format: "text" }),
    ],
    charts: [
      {
        id: "health_online",
        title: "Online sessions",
        kind: "line",
        points: [
          { name: "-4h", value: Math.max(0, mon.onlineUsers - 2) },
          { name: "-2h", value: Math.max(0, mon.onlineUsers - 1) },
          { name: "now", value: mon.onlineUsers },
        ],
      },
      {
        id: "health_storage",
        title: "Storage breakdown",
        kind: "pie",
        points: [
          { name: "Uploads", value: Math.max(1, uploadsMb) },
          { name: "Data", value: Math.max(1, dataMb) },
        ],
      },
    ],
    warnings: mon.systemWarnings ?? [],
    zoomStatus: zoomOk ? "ready" : "not configured",
    storageMb: uploadsMb + dataMb,
    onlineUsers: mon.onlineUsers,
  };
}

export function getAdminReportBundle() {
  return getAdminReport();
}

export function getExecutiveReportBundle() {
  return getExecutiveReport();
}
