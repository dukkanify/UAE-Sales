import type { Metadata } from "next";

import { ScheduleHubView } from "@/features/schedule/components/schedule-hub-view";

export const metadata: Metadata = { title: "Schedule" };

export default function InstructorSchedulePage() {
  return (
    <ScheduleHubView
      role="instructor"
      breadcrumbs={[{ label: "Instructor" }, { label: "Schedule" }]}
      calendarHref="/instructor/calendar"
    />
  );
}
