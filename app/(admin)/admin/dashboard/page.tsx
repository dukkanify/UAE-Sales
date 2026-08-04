import type { Metadata } from "next";

import { AdminDashboardView } from "@/features/dashboard/admin-dashboard-view";
import {
  getAdminOverview,
  getDashboardCalendarEvents,
  getEnrollmentSeries,
  getGrowthSeries,
  getRecentActivityFeed,
} from "@/services/dashboard/metrics";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
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
