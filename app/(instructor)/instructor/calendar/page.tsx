"use client";

import { LiveCalendarView } from "@/features/classes/components/live-calendar-view";

export default function InstructorCalendarPage() {
  return (
    <LiveCalendarView roleLabel="Instructor" classesHref="/instructor/classes" />
  );
}
