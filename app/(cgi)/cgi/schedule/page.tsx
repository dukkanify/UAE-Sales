import type { Metadata } from "next";

import { CgiScheduleView } from "@/features/cgi/components/cgi-schedule-view";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { listLiveClasses } from "@/services/classes/class-service";

export const metadata: Metadata = { title: "CGI Schedule" };

export default function CgiSchedulePage() {
  ensureClassesSeeded();
  const classes = listLiveClasses({ pageSize: 50 }).data.map((c) => ({
    id: c.id,
    title: c.title,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    status: c.status,
    instructorId: c.instructorId,
  }));
  return <CgiScheduleView initialClasses={classes} />;
}
