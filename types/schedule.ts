/**
 * Dynamic Schedule Management (CR008) — Live Courses + ATPL.
 */

import type { AttendanceStatus, LiveClassStatus, RecurrenceFrequency } from "@/types/classes";

export type ScheduleSource = "live_course" | "atpl";

export type ScheduleAudience = "student" | "instructor" | "all";

export type TimelineEventKind =
  | "scheduled"
  | "rescheduled"
  | "cancelled"
  | "completed"
  | "live"
  | "upcoming"
  | "reminder_student"
  | "reminder_instructor"
  | "attendance"
  | "lecture_assigned";

export interface ScheduleSession {
  id: string;
  title: string;
  description: string;
  source: ScheduleSource;
  courseId: string | null;
  courseTitle: string | null;
  courseCode: string | null;
  lessonId: string | null;
  instructorId: string;
  instructorName: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  status: LiveClassStatus;
  computedStatus: LiveClassStatus | "upcoming" | "live_now";
  recurringRuleId: string | null;
  isRecurring: boolean;
  parentClassId: string | null;
  lectureAssignmentId: string | null;
  zoomJoinUrl: string | null;
  attendance: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
  };
  enrolledCount: number;
}

export interface NextSessionInfo {
  session: ScheduleSession | null;
  startsInMinutes: number | null;
  pendingStudentReminders: number;
  pendingInstructorReminders: number;
}

export interface TimelineEvent {
  id: string;
  at: string;
  kind: TimelineEventKind;
  title: string;
  detail: string;
  liveClassId: string | null;
  source: ScheduleSource | "system";
  status: string | null;
}

export interface ScheduleBuilderInput {
  title: string;
  description?: string;
  courseId?: string | null;
  lessonId?: string | null;
  lessonTitle?: string | null;
  instructorId: string;
  studentIds?: string[];
  startsAt: string;
  endsAt?: string;
  durationMinutes?: number;
  timezone?: string;
  maxStudents?: number;
  /** When true (default), create/link an ATPL lecture assignment if course is ATPL. */
  linkAtplLecture?: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval?: number;
    byWeekday?: number[];
    count?: number | null;
    until?: string | null;
  };
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ScheduleOverview {
  nextSession: NextSessionInfo;
  upcoming: ScheduleSession[];
  timeline: TimelineEvent[];
  stats: {
    upcoming: number;
    liveNow: number;
    completed: number;
    cancelled: number;
    recurringSeries: number;
  };
}

export interface MarkAttendanceInput {
  liveClassId: string;
  studentId: string;
  status: AttendanceStatus;
  joinTime?: string | null;
  leaveTime?: string | null;
  notes?: string | null;
  actorId: string;
}
