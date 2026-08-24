/**
 * Live Classes / Zoom / Scheduling domain types.
 */

export type LiveClassStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type MeetingType = "meeting" | "webinar";

export type RecurrenceFrequency = "once" | "daily" | "weekly" | "monthly";

export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "excused"
  | "unknown";

export type ReminderChannel = "email" | "in_app";

export type ReminderKind =
  | "24h"
  | "2h"
  | "15m"
  | "live_now"
  | "cancelled"
  | "rescheduled"
  | "recording";

export interface ZoomMeetingRecord {
  id: string;
  liveClassId: string;
  /** Zoom numeric meeting id (string for large ints) */
  zoomMeetingId: string;
  zoomUuid: string | null;
  joinUrl: string;
  startUrl: string;
  password: string;
  hostEmail: string | null;
  waitingRoom: boolean;
  passcodeEnabled: boolean;
  coHostEmails: string[];
  /** Mock vs live Zoom API */
  providerMode: "mock" | "zoom";
  raw: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringRule {
  id: string;
  frequency: RecurrenceFrequency;
  interval: number;
  /** 0=Sun … 6=Sat for weekly */
  byWeekday: number[];
  count: number | null;
  until: string | null;
  timezone: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  courseId: string | null;
  moduleId: string | null;
  lessonId: string | null;
  instructorId: string;
  assistantInstructorId: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  maxStudents: number;
  meetingType: MeetingType;
  status: LiveClassStatus;
  zoomMeetingId: string | null;
  recurringRuleId: string | null;
  parentClassId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  rescheduledFromId: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LiveClassListItem extends LiveClass {
  courseTitle: string | null;
  courseCode: string | null;
  instructorName: string | null;
  assistantName: string | null;
  enrolledCount: number;
  computedStatus: LiveClassStatus | "upcoming" | "live_now";
  zoomJoinUrl: string | null;
}

export interface AttendanceRecord {
  id: string;
  liveClassId: string;
  studentId: string;
  status: AttendanceStatus;
  joinTime: string | null;
  leaveTime: string | null;
  durationSeconds: number;
  attendancePercent: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceWithStudent extends AttendanceRecord {
  studentName: string | null;
  studentEmail: string | null;
}

export interface MeetingParticipant {
  id: string;
  liveClassId: string;
  userId: string;
  role: "host" | "cohost" | "participant";
  invitedAt: string;
  joinedAt: string | null;
}

export interface MeetingRecording {
  id: string;
  liveClassId: string;
  zoomMeetingId: string | null;
  title: string;
  url: string;
  fileType: string;
  fileSizeBytes: number | null;
  durationSeconds: number | null;
  availableFrom: string;
  expiresAt: string | null;
  instructorAccess: boolean;
  studentAccess: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderQueueItem {
  id: string;
  liveClassId: string;
  userId: string;
  kind: ReminderKind;
  channel: ReminderChannel;
  scheduledFor: string;
  sentAt: string | null;
  status: "pending" | "sent" | "cancelled" | "failed";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ClassFilters {
  q?: string;
  courseId?: string;
  instructorId?: string;
  status?: LiveClassStatus | "all" | "upcoming" | "live_now";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface ClassStats {
  today: number;
  upcoming: number;
  liveNow: number;
  completed: number;
  cancelled: number;
  attendanceRate: number;
  recentlyUpdated: LiveClassListItem[];
}

export interface CalendarViewEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type?: string;
  status?: string;
  startsAt: string;
  endsAt: string;
  liveClassId: string;
  courseCode?: string | null;
}

export interface CreateLiveClassInput {
  title: string;
  description?: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  instructorId: string;
  assistantInstructorId?: string | null;
  startsAt: string;
  endsAt?: string;
  durationMinutes?: number;
  timezone?: string;
  maxStudents?: number;
  meetingType?: MeetingType;
  status?: LiveClassStatus;
  waitingRoom?: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval?: number;
    byWeekday?: number[];
    count?: number | null;
    until?: string | null;
  };
  enrollStudentIds?: string[];
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
