import type { Metadata } from "next";

import { SuperAdminDashboardView } from "@/features/dashboard/super-admin-dashboard-view";
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

export default function SuperAdminDashboardPage() {
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
