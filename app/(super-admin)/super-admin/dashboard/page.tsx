import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SuperAdminDashboardView } from "@/features/dashboard/super-admin-dashboard-view";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { getCurrentSession } from "@/services/auth/auth-service";
import {
  getAttendanceSeries,
  getDashboardCalendarEvents,
  getEnrollmentSeries,
  getGrowthSeries,
  getPlatformOverview,
  getRecentActivityFeed,
  getRevenueSeries,
} from "@/services/dashboard/metrics";

export const metadata: Metadata = { title: "Super Admin Dashboard" };

export default async function SuperAdminDashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  if (user.role !== ROLES.SUPER_ADMIN) redirect(routes.accessDenied);

  return (
    <SuperAdminDashboardView
      overview={getPlatformOverview()}
      growth={getGrowthSeries()}
      revenue={getRevenueSeries()}
      enrollments={getEnrollmentSeries()}
      attendance={getAttendanceSeries()}
      activity={getRecentActivityFeed()}
      calendar={getDashboardCalendarEvents()}
    />
  );
}
