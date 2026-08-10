import type { Metadata } from "next";

import { ScheduleHubView } from "@/features/schedule/components/schedule-hub-view";

export const metadata: Metadata = { title: "Schedule" };

export default function StudentSchedulePage() {
  return (
    <ScheduleHubView
      role="student"
      breadcrumbs={[{ label: "Student" }, { label: "Schedule" }]}
      calendarHref="/student/calendar"
    />
  );
}
