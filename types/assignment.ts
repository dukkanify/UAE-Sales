/**
 * Instructor Assignment Engine types (CR005 — ATPL journey).
 */

export type AssignmentScheduleStatus =
  "scheduling_required" | "queued" | "scheduled" | "unable_to_schedule" | "cancelled";

export type AssignmentKind = "assign" | "reassign" | "schedule_session";

export interface InstructorAvailabilityWindow {
  id: string;
  instructorId: string;
  /** 0=Sun … 6=Sat */
  weekday: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorAvailabilityBlock {
  id: string;
  instructorId: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  createdAt: string;
}

export interface AssignmentRequest {
  id: string;
  kind: AssignmentKind;
  courseId: string;
  lessonId: string | null;
  lessonTitle: string;
  studentId: string | null;
  instructorId: string;
  previousInstructorId: string | null;
  preferredStartsAt: string | null;
  durationMinutes: number;
  status: AssignmentScheduleStatus;
  liveClassId: string | null;
  zoomMeetingId: string | null;
  conflictSummary: string | null;
  queuePosition: number | null;
  attempts: number;
  maxAttempts: number;
  autoZoom: boolean;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  scheduledAt: string | null;
  unableReason: string | null;
}

export interface WaitingQueueItem {
  id: string;
  assignmentRequestId: string;
  instructorId: string;
  courseId: string;
  preferredStartsAt: string | null;
  durationMinutes: number;
  priority: number;
  status: "waiting" | "processing" | "fulfilled" | "failed" | "cancelled";
  enqueuedAt: string;
  updatedAt: string;
  lastCheckedAt: string | null;
  failureReason: string | null;
}

export type ConflictSource =
  "live_class" | "booking" | "availability_block" | "outside_availability";

export interface ConflictHit {
  source: ConflictSource;
  label: string;
  startsAt: string;
  endsAt: string;
  entityId: string | null;
}

export interface ConflictReport {
  instructorId: string;
  startsAt: string;
  endsAt: string;
  hasConflict: boolean;
  conflicts: ConflictHit[];
  available: boolean;
}

export interface InstructorCalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  type: "live_class" | "booking" | "availability" | "block" | "queue";
  status: string;
  courseId: string | null;
  liveClassId: string | null;
  assignmentRequestId: string | null;
}

export interface AssignmentEngineSettings {
  autoZoom: boolean;
  defaultDurationMinutes: number;
  maxQueueAttempts: number;
  lookAheadDays: number;
  slotStepMinutes: number;
  updatedAt: string;
}

export interface ScheduleSessionResult {
  request: AssignmentRequest;
  queueItem: WaitingQueueItem | null;
  liveClassId: string | null;
  zoomMeetingId: string | null;
  conflicts: ConflictHit[];
  outcome: AssignmentScheduleStatus;
}
