/**
 * Natural-language AI search → platform actions/results.
 */

import { assertAiAccess, assertRateLimit, canUseAdminInsights } from "@/services/ai/access";
import { ensureAiSeeded } from "@/services/ai/seed";
import { listCourses } from "@/services/courses/course-service";
import { getCalendarEventsForUser } from "@/services/classes/calendar-service";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { listOrders } from "@/services/payments/checkout-service";
import { getClassStats } from "@/services/classes/class-service";
import { getStudentProgressSnapshot } from "@/services/certificates/progress-service";
import type { AiSearchResult } from "@/types/ai";
import type { UserProfile } from "@/types";

export function aiSearch(user: UserProfile, query: string): {
  interpretation: string;
  results: AiSearchResult[];
} {
  ensureAiSeeded();
  assertAiAccess(user);
  assertRateLimit(user.id);
  const q = query.toLowerCase();
  const results: AiSearchResult[] = [];
  let interpretation = "General platform search";

  if (/upcoming class|live class|my classes/.test(q)) {
    interpretation = "Upcoming live classes";
    const events = getCalendarEventsForUser(user).slice(0, 8);
    for (const e of events) {
      results.push({
        type: "class",
        id: e.id,
        title: e.title,
        href: user.role === ROLES.STUDENT ? "/student/calendar" : `/${rolePath(user)}/classes`,
        snippet: `${e.date} ${e.time ?? ""}`.trim(),
      });
    }
  }

  if (/atpl|navigation|lesson|course/.test(q)) {
    interpretation = "Course / lesson catalog search";
    const courses = listCourses({ pageSize: 50, q: query.replace(/find|show|all/gi, "").trim() }).data;
    for (const c of courses.slice(0, 8)) {
      results.push({
        type: "course",
        id: c.id,
        title: `${c.code} — ${c.title}`,
        href: `/${rolePath(user)}/courses/${c.id}`,
        snippet: c.shortDescription.slice(0, 120),
      });
    }
  }

  if (/low attendance|inactive student|at risk/.test(q) && canUseAdminInsights(user)) {
    interpretation = "Students needing attention";
    const students = readAuthDb().users.filter(
      (u) => u.role === ROLES.STUDENT && u.status === ACCOUNT_STATUS.ACTIVE,
    );
    for (const s of students.slice(0, 10)) {
      const snap = getStudentProgressSnapshot(s.id);
      if (snap.attendanceRate < 75 || snap.overallPercent < 40) {
        results.push({
          type: "student",
          id: s.id,
          title: toUserProfile(s).fullName || s.email,
          href: `/${rolePath(user)}/students`,
          snippet: `Progress ${Math.round(snap.overallPercent)}% · Attendance ${Math.round(snap.attendanceRate)}%`,
        });
      }
    }
  }

  if (/unpaid|invoice|payment/.test(q) && canUseAdminInsights(user)) {
    interpretation = "Unpaid / pending invoices";
    const pending = listOrders().filter((o) => o.status === "pending" || o.status === "failed");
    for (const o of pending.slice(0, 10)) {
      results.push({
        type: "order",
        id: o.id,
        title: o.orderNumber,
        href: "/super-admin/payments",
        snippet: `Status ${o.status} · ${o.totalAmount} ${o.currency}`,
      });
    }
  }

  if (!results.length) {
    interpretation = "No specialized intent matched — showing live class stats";
    const stats = getClassStats(user.role === ROLES.INSTRUCTOR ? user.id : undefined);
    results.push({
      type: "stats",
      id: "live-stats",
      title: "Live class overview",
      href: `/${rolePath(user)}/classes`,
      snippet: `Upcoming ${stats.upcoming} · Today ${stats.today} · Attendance ${Math.round(stats.attendanceRate)}%`,
    });
  }

  return { interpretation, results };
}

function rolePath(user: UserProfile) {
  if (user.role === ROLES.SUPER_ADMIN) return "super-admin";
  if (user.role === ROLES.ADMIN) return "admin";
  if (user.role === ROLES.INSTRUCTOR) return "instructor";
  return "student";
}
