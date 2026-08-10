import type { Metadata } from "next";

import { ScheduleHubView } from "@/features/schedule/components/schedule-hub-view";

export const metadata: Metadata = { title: "CGI Schedule" };

export default function CgiSchedulePage() {
  return (
    <ScheduleHubView
      role="cgi"
      breadcrumbs={[{ label: "CGI" }, { label: "Schedule" }]}
      calendarHref="/cgi/lectures"
    />
  );
}
