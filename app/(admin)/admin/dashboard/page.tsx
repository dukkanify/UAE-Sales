import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboardView } from "@/features/dashboard/admin-dashboard-view";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
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

  return (
    <AdminDashboardView
      overview={getAdminOverview()}
      growth={getGrowthSeries()}
      enrollments={getEnrollmentSeries()}
      activity={getRecentActivityFeed()}
      calendar={getDashboardCalendarEvents()}
    />
  );
}
