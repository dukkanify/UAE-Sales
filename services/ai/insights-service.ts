/**
 * Admin AI insights — grounded in analytics/certificates/classes data.
 */

import { generateId } from "@/lib/security/crypto";
import {
  assertAiAccess,
  canUseAdminInsights,
  AiError,
  resolvePersona,
} from "@/services/ai/access";
import { ensureAiSeeded } from "@/services/ai/seed";
import { writeAiDb } from "@/services/ai/store";
import { buildExecutiveAnalytics, buildLearningAnalytics, buildSupportAnalytics } from "@/services/analytics/aggregator";
import { getClassStats } from "@/services/classes/class-service";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { getStudentProgressSnapshot } from "@/services/certificates/progress-service";
import { getPlatformAssessmentOverview } from "@/services/quizzes/analytics-service";
import type { AiInsight } from "@/types/ai";
import type { UserProfile } from "@/types";

export function generateInsights(user: UserProfile): AiInsight[] {
  ensureAiSeeded();
  assertAiAccess(user);
  if (!canUseAdminInsights(user)) {
    throw new AiError("Admin AI insights restricted", 403);
  }

  const exec = buildExecutiveAnalytics();
  const learning = buildLearningAnalytics();
  const support = buildSupportAnalytics();
  const classStats = getClassStats();
  let quizOverview: { totalAttempts?: number; needsReview?: number } = {};
  try {
    quizOverview = getPlatformAssessmentOverview();
  } catch {
    quizOverview = {};
  }

  const insights: AiInsight[] = [];

  const students = readAuthDb().users.filter(
    (u) => u.role === ROLES.STUDENT && u.status === ACCOUNT_STATUS.ACTIVE,
  );
  let atRisk = 0;
  let inactive = 0;
  for (const s of students) {
    const snap = getStudentProgressSnapshot(s.id);
    if (snap.overallPercent < 35 || snap.attendanceRate < 60) atRisk += 1;
    if (snap.learningHours < 1) inactive += 1;
  }

  insights.push({
    id: generateId(),
    kind: "students_at_risk",
    title: "Students at risk",
    detail: `${atRisk} active students show low progress or attendance.`,
    severity: atRisk > 2 ? "critical" : atRisk > 0 ? "warning" : "info",
    metric: atRisk,
  });
  insights.push({
    id: generateId(),
    kind: "inactive_students",
    title: "Inactive students",
    detail: `${inactive} students have under 1 hour of recorded learning time.`,
    severity: inactive > 0 ? "warning" : "info",
    metric: inactive,
  });

  const weakCourses = learning.courses
    .filter((c) => c.completionRate < 50 && c.enrollments > 0)
    .slice(0, 3);
  insights.push({
    id: generateId(),
    kind: "courses_need_improvement",
    title: "Courses needing improvement",
    detail: weakCourses.length
      ? weakCourses.map((c) => `${c.title} (${c.completionRate}% completion)`).join("; ")
      : "No low-completion courses detected in current data.",
    severity: weakCourses.length ? "warning" : "info",
    metric: weakCourses.length,
  });

  insights.push({
    id: generateId(),
    kind: "quiz_performance",
    title: "Quiz performance",
    detail: `Platform assessment attempts: ${quizOverview.totalAttempts ?? 0}. Needs review: ${quizOverview.needsReview ?? 0}.`,
    severity: (quizOverview.needsReview ?? 0) > 0 ? "warning" : "info",
    metric: quizOverview.totalAttempts ?? 0,
  });

  insights.push({
    id: generateId(),
    kind: "attendance_trend",
    title: "Attendance trend",
    detail: `Live class attendance rate is ${Math.round(classStats.attendanceRate)}% with ${classStats.upcoming} upcoming sessions.`,
    severity: classStats.attendanceRate < 70 ? "warning" : "info",
    metric: Math.round(classStats.attendanceRate),
  });

  const completionKpi = exec.kpis.find((k) => k.id === "completion");
  insights.push({
    id: generateId(),
    kind: "completion_trend",
    title: "Completion trend",
    detail: `Course completion KPI: ${completionKpi?.value ?? "n/a"}.`,
    severity: "info",
    metric: completionKpi?.value,
  });

  const openTickets = support.kpis.find((k) => k.id === "open");
  insights.push({
    id: generateId(),
    kind: "support_load",
    title: "Support load",
    detail: `Open support tickets: ${openTickets?.value ?? 0}.`,
    severity: Number(openTickets?.value ?? 0) > 5 ? "warning" : "info",
    metric: openTickets?.value,
  });

  insights.push({
    id: generateId(),
    kind: "instructor_engagement",
    title: "Instructor engagement",
    detail: `${readAuthDb().users.filter((u) => u.role === ROLES.INSTRUCTOR && u.status === ACCOUNT_STATUS.ACTIVE).length} active instructors · live now ${classStats.liveNow}.`,
    severity: "info",
    metric: classStats.liveNow,
  });

  writeAiDb((db) => {
    db.usage.push({
      id: generateId(),
      userId: user.id,
      persona: resolvePersona(user),
      action: "insights",
      tokensIn: 20,
      tokensOut: 80,
      conversationId: null,
      createdAt: new Date().toISOString(),
    });
  });

  void toUserProfile;
  return insights;
}
