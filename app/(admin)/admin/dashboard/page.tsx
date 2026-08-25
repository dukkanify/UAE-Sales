import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboardView } from "@/features/dashboard/admin-dashboard-view";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { newDashboardCorrelationId, safeDashboardQuery } from "@/lib/dashboard/safe-load";
import { getCurrentSession } from "@/services/auth/auth-service";
import {
  getAdminOverview,
  getDashboardCalendarEvents,
  getEnrollmentSeries,
  getGrowthSeries,
  getRecentActivityFeed,
} from "@/services/dashboard/metrics";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  if (user.role !== ROLES.ADMIN && user.role !== ROLES.SUPER_ADMIN) {
    redirect(routes.accessDenied);
  }

  const correlationId = newDashboardCorrelationId();
  const base = {
    userId: user.id,
    role: user.role,
    correlationId,
    path: "/admin/dashboard",
  };

  return (
    <AdminDashboardView
      overview={safeDashboardQuery({
        ...base,
        label: "getAdminOverview",
        fallback: {
          students: 0,
          instructors: 0,
          courses: 0,
          liveClasses: 0,
          pendingApprovals: 0,
          communityReports: 0,
          blogActivity: 0,
        },
        run: () => getAdminOverview(),
      })}
      growth={safeDashboardQuery({
        ...base,
        label: "getGrowthSeries",
        fallback: [],
        run: () => getGrowthSeries(),
      })}
      enrollments={safeDashboardQuery({
        ...base,
        label: "getEnrollmentSeries",
        fallback: [],
        run: () => getEnrollmentSeries(),
      })}
      activity={safeDashboardQuery({
        ...base,
        label: "getRecentActivityFeed",
        fallback: [],
        run: () => getRecentActivityFeed(),
      })}
      calendar={safeDashboardQuery({
        ...base,
        label: "getDashboardCalendarEvents",
        fallback: [],
        run: () => getDashboardCalendarEvents(),
      })}
    />
  );
}
