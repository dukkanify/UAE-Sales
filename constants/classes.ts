/**
 * Live class / Zoom constants.
 */

import type {
  AttendanceStatus,
  LiveClassStatus,
  MeetingType,
  RecurrenceFrequency,
  ReminderKind,
} from "@/types/classes";

export const LIVE_CLASS_STATUSES: LiveClassStatus[] = [
  "draft",
  "scheduled",
  "live",
  "completed",
  "cancelled",
  "rescheduled",
];

export const LIVE_CLASS_STATUS_LABELS: Record<LiveClassStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  live: "Live Now",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

export const MEETING_TYPES: MeetingType[] = ["meeting", "webinar"];

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  meeting: "Meeting",
  webinar: "Webinar",
};

export const RECURRENCE_FREQUENCIES: RecurrenceFrequency[] = [
  "once",
  "daily",
  "weekly",
  "monthly",
];

export const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  once: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "present",
  "late",
  "absent",
  "excused",
  "unknown",
];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  unknown: "Unknown",
};

export const REMINDER_KINDS: ReminderKind[] = [
  "24h",
  "2h",
  "15m",
  "live_now",
  "cancelled",
  "rescheduled",
  "recording",
];

/** Default reminder offsets in minutes before start */
export const DEFAULT_REMINDER_OFFSETS_MINUTES = {
  "24h": 24 * 60,
  "2h": 2 * 60,
  "15m": 15,
} as const;

export const DEFAULT_CLASS_PAGE_SIZE = 20;
export const DEFAULT_CLASS_DURATION_MINUTES = 60;
export const DEFAULT_MAX_STUDENTS = 30;
