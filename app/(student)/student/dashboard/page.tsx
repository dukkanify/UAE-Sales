import type { Metadata } from "next";

import { StudentDashboardView } from "@/features/dashboard/student-dashboard-view";
import {
  getAttendanceSeries,
  getDashboardCalendarEvents,
  getStudentOverview,
} from "@/services/dashboard/metrics";

export const metadata: Metadata = { title: "Student Dashboard" };

export default function StudentDashboardPage() {
  return (
    <StudentDashboardView
      overview={getStudentOverview()}
      calendar={getDashboardCalendarEvents()}
      attendance={getAttendanceSeries()}
    />
  );
}
