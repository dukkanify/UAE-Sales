import type { Metadata } from "next";

import { ScheduleHubView } from "@/features/schedule/components/schedule-hub-view";

export const metadata: Metadata = { title: "Schedule" };

export default function AdminSchedulePage() {
  return (
    <ScheduleHubView
      role="admin"
      breadcrumbs={[{ label: "Admin" }, { label: "Schedule" }]}
      calendarHref="/admin/classes"
    />
  );
}
