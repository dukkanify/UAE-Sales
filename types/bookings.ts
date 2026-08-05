/**
 * Appointment booking types — 24/7 Zoom self-booking with admin control.
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

export interface BookingZoomSession {
  meetingNumber: string;
  joinUrl: string;
  startUrl: string;
  password: string;
  waitingRoom: boolean;
  providerMode: "mock" | "zoom";
  provisionedAt: string;
}

export interface BookingSettings {
  /** Master switch — when false, students cannot create bookings */
  enabled: boolean;
  /** Allow booking from public site before / without prior registration */
  allowGuestBooking: boolean;
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
  /** Auto-create Zoom meeting when booking is confirmed */
  autoCreateZoom: boolean;
  /** Zoom waiting room for booking meetings */
  zoomWaitingRoom: boolean;
  /** Require Zoom passcode */
  zoomPasscode: boolean;
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
  /** Null until guest verifies OTP / account is linked */
  studentId: string | null;
  instructorId: string;
  sessionTypeId: string;
  sessionTypeName: string;
  title: string;
  notes: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  zoom: BookingZoomSession | null;
  /** Guest booking before registration */
  guestEmail: string | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestVerified: boolean;
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

export interface BookingJoinPayload {
  booking: BookingListItem;
  join: {
    meetingNumber: string;
    joinUrl: string;
    startUrl: string | null;
    password: string;
    waitingRoom: boolean;
    providerMode: "mock" | "zoom";
  };
  isHost: boolean;
  canJoin: boolean;
  joinWindowLabel: string;
}

export interface PublicBookingCatalog {
  enabled: boolean;
  allowGuestBooking: boolean;
  aroundTheClock: boolean;
  maxAdvanceDays: number;
  autoCreateZoom: boolean;
  requireConfirmation: boolean;
  timezone: string;
  sessionTypes: BookingSessionType[];
  instructors: Array<{
    id: string;
    fullName: string;
    firstName: string | null;
    lastName: string | null;
  }>;
}
