/**
 * Appointment booking types — 24/7 client self-booking with admin control.
 */

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingSessionType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  active: boolean;
}

export interface BookingSettings {
  /** Master switch — when false, students cannot create bookings */
  enabled: boolean;
  /** Generate slots every hour of the day (00:00–23:00) */
  aroundTheClock: boolean;
  /** Used when aroundTheClock is false — local hours inclusive start */
  dayStartHour: number;
  /** Used when aroundTheClock is false — local hours exclusive end */
  dayEndHour: number;
  /** Default slot length when session type has no override */
  slotDurationMinutes: number;
  /** Minutes blocked after each booking */
  bufferMinutes: number;
  /** How far ahead students may book */
  maxAdvanceDays: number;
  /** Minutes before start when booking closes */
  minNoticeMinutes: number;
  /** If true, new bookings stay pending until admin confirms */
  requireConfirmation: boolean;
  /** Empty = all active instructors bookable */
  instructorIds: string[];
  sessionTypes: BookingSessionType[];
  /** ISO date strings (yyyy-MM-dd) blocked platform-wide */
  blackoutDates: string[];
  timezone: string;
  updatedAt: string;
}

export interface AppointmentBooking {
  id: string;
  studentId: string;
  instructorId: string;
  sessionTypeId: string;
  sessionTypeName: string;
  title: string;
  notes: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
}

export interface BookingSlot {
  startsAt: string;
  endsAt: string;
  available: boolean;
  reason?: string;
}

export interface BookingListItem extends AppointmentBooking {
  studentName?: string;
  instructorName?: string;
}
