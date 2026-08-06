import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { InstructorDashboardView } from "@/features/dashboard/instructor-dashboard-view";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { getCurrentSession } from "@/services/auth/auth-service";
import {
  getAttendanceSeries,
  getDashboardCalendarEvents,
  getEarningsSeries,
  getInstructorOverview,
  getProgressBreakdown,
} from "@/services/dashboard/metrics";

export const metadata: Metadata = { title: "Instructor Dashboard" };

export default async function InstructorDashboardPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  if (user.role !== ROLES.INSTRUCTOR) redirect(routes.accessDenied);

  return (
    <InstructorDashboardView
      overview={getInstructorOverview(user.id)}
      earnings={getEarningsSeries()}
      attendance={getAttendanceSeries()}
      progress={getProgressBreakdown()}
      calendar={getDashboardCalendarEvents()}
    />
  );
}
