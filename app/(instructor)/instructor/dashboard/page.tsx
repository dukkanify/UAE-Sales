import type { Metadata } from "next";

import { InstructorDashboardView } from "@/features/dashboard/instructor-dashboard-view";
import {
  getAttendanceSeries,
  getDashboardCalendarEvents,
  getEarningsSeries,
  getInstructorOverview,
  getProgressBreakdown,
} from "@/services/dashboard/metrics";

export const metadata: Metadata = { title: "Instructor Dashboard" };

export default function InstructorDashboardPage() {
  return (
    <InstructorDashboardView
      overview={getInstructorOverview()}
      earnings={getEarningsSeries()}
      attendance={getAttendanceSeries()}
      progress={getProgressBreakdown()}
      calendar={getDashboardCalendarEvents()}
    />
  );
}
