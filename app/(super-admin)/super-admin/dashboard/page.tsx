import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SuperAdminDashboardView } from "@/features/dashboard/super-admin-dashboard-view";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { newDashboardCorrelationId, safeDashboardQuery } from "@/lib/dashboard/safe-load";
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

const EMPTY_PLATFORM = {
  totalStudents: 0,
  totalInstructors: 0,
  totalAdmins: 0,
  totalUsers: 0,
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  activeCourseStudents: 0,
  activeClasses: 0,
  upcomingClasses: 0,
  cancelledClasses: 0,
  attendanceRate: 0,
  monthlyRevenue: 0,
  instructorWalletBalance: 0,
  pendingPayments: 0,
  platformGrowth: 0,
  pendingApprovals: 0,
  communityReports: 0,
  blogActivity: 0,
  liveClasses: 0,
  activeSessions: 0,
};

export default async function SuperAdminDashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  if (user.role !== ROLES.SUPER_ADMIN) redirect(routes.accessDenied);

  const correlationId = newDashboardCorrelationId();
  const base = {
    userId: user.id,
    role: user.role,
    correlationId,
    path: "/super-admin/dashboard",
  };

  return (
    <SuperAdminDashboardView
      overview={safeDashboardQuery({
        ...base,
        label: "getPlatformOverview",
        fallback: EMPTY_PLATFORM,
        run: () => getPlatformOverview(),
      })}
      growth={safeDashboardQuery({
        ...base,
        label: "getGrowthSeries",
        fallback: [],
        run: () => getGrowthSeries(),
      })}
      revenue={safeDashboardQuery({
        ...base,
        label: "getRevenueSeries",
        fallback: [],
        run: () => getRevenueSeries(),
      })}
      enrollments={safeDashboardQuery({
        ...base,
        label: "getEnrollmentSeries",
        fallback: [],
        run: () => getEnrollmentSeries(),
      })}
      attendance={safeDashboardQuery({
        ...base,
        label: "getAttendanceSeries",
        fallback: [],
        run: () => getAttendanceSeries(),
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
