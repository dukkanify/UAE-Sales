/**
 * 24/7 appointment booking — admin-controlled settings, student self-book.
 */

import { addDays, addMinutes, format, isBefore, parseISO, startOfDay } from "date-fns";

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLES } from "@/constants/roles";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { BookingAccessError } from "@/services/bookings/access";
import { defaultBookingSettings, readBookingsDb, writeBookingsDb } from "@/services/bookings/store";
import type {
  AppointmentBooking,
  BookingListItem,
  BookingSettings,
  BookingSlot,
  BookingStatus,
} from "@/types/bookings";
import type { UserProfile } from "@/types";

const ACTIVE_BOOKING: BookingStatus[] = ["pending", "confirmed"];

function displayName(userId: string): string {
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) return "Unknown";
  return `${u.firstName} ${u.lastName}`.trim() || u.email;
}

export function getBookingSettings(): BookingSettings {
  return readBookingsDb().settings;
}

export async function updateBookingSettings(input: {
  user: UserProfile;
  patch: Partial<
    Omit<BookingSettings, "updatedAt" | "sessionTypes"> & {
      sessionTypes?: BookingSettings["sessionTypes"];
    }
  >;
}): Promise<BookingSettings> {
  if (input.user.role !== ROLES.ADMIN && input.user.role !== ROLES.SUPER_ADMIN) {
    throw new BookingAccessError("Admin access required", 403);
  }

  let next: BookingSettings = defaultBookingSettings();
  writeBookingsDb((db) => {
    next = {
      ...db.settings,
      ...input.patch,
      sessionTypes: input.patch.sessionTypes ?? db.settings.sessionTypes,
      blackoutDates: input.patch.blackoutDates ?? db.settings.blackoutDates,
      instructorIds: input.patch.instructorIds ?? db.settings.instructorIds,
      aroundTheClock: input.patch.aroundTheClock ?? db.settings.aroundTheClock,
      enabled: input.patch.enabled ?? db.settings.enabled,
      updatedAt: new Date().toISOString(),
    };
    if (next.slotDurationMinutes < 15 || next.slotDurationMinutes > 240) {
      throw new BookingAccessError("Slot duration must be between 15 and 240 minutes");
    }
    if (!next.aroundTheClock) {
      if (next.dayStartHour < 0 || next.dayEndHour > 24 || next.dayStartHour >= next.dayEndHour) {
        throw new BookingAccessError("Invalid day hours");
      }
    }
    db.settings = next;
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.BOOKING_SETTINGS_UPDATED,
    entityType: "booking_settings",
    entityId: "platform",
  });

  return next;
}

export function listBookableInstructors(): UserProfile[] {
  const settings = getBookingSettings();
  const instructors = readAuthDb()
    .users.filter((u) => u.role === ROLES.INSTRUCTOR && u.status === ACCOUNT_STATUS.ACTIVE)
    .map(toUserProfile);

  if (!settings.instructorIds.length) return instructors;
  const allow = new Set(settings.instructorIds);
  return instructors.filter((i) => allow.has(i.id));
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function getAvailableSlots(input: {
  date: string; // yyyy-MM-dd
  instructorId: string;
  sessionTypeId: string;
}): BookingSlot[] {
  const settings = getBookingSettings();
  if (!settings.enabled) return [];

  const sessionType = settings.sessionTypes.find((t) => t.id === input.sessionTypeId && t.active);
  if (!sessionType) throw new BookingAccessError("Session type not available", 404);

  const instructors = listBookableInstructors();
  if (!instructors.some((i) => i.id === input.instructorId)) {
    throw new BookingAccessError("Instructor not available for booking", 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new BookingAccessError("date must be yyyy-MM-dd");
  }

  if (settings.blackoutDates.includes(input.date)) return [];

  const day = startOfDay(parseISO(`${input.date}T00:00:00`));
  const today = startOfDay(new Date());
  if (isBefore(day, today)) return [];

  const maxDay = addDays(today, settings.maxAdvanceDays);
  if (day > maxDay) return [];

  const duration = sessionType.durationMinutes || settings.slotDurationMinutes;
  const startHour = settings.aroundTheClock ? 0 : settings.dayStartHour;
  const endHour = settings.aroundTheClock ? 24 : settings.dayEndHour;

  const bookings = readBookingsDb().bookings.filter(
    (b) =>
      b.instructorId === input.instructorId &&
      ACTIVE_BOOKING.includes(b.status) &&
      b.startsAt.startsWith(input.date),
  );

  const now = new Date();
  const earliest = addMinutes(now, settings.minNoticeMinutes);

  return generateSlotsReliable({
    day,
    duration,
    settings,
    bookings,
    earliest,
    startHour,
    endHour,
  });
}

function generateSlotsReliable(input: {
  day: Date;
  duration: number;
  settings: BookingSettings;
  bookings: AppointmentBooking[];
  earliest: Date;
  startHour: number;
  endHour: number;
}): BookingSlot[] {
  const { day, duration, settings, bookings, earliest, startHour, endHour } = input;
  const step = duration;
  const slots: BookingSlot[] = [];

  const dayStart = new Date(day);
  dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = new Date(day);
  if (endHour >= 24) {
    dayEnd.setDate(dayEnd.getDate() + 1);
    dayEnd.setHours(0, 0, 0, 0);
  } else {
    dayEnd.setHours(endHour, 0, 0, 0);
  }

  for (let t = dayStart.getTime(); t + duration * 60_000 <= dayEnd.getTime(); t += step * 60_000) {
    const startsAt = new Date(t);
    const endsAt = addMinutes(startsAt, duration);
    let available = true;
    let reason: string | undefined;

    if (startsAt < earliest) {
      available = false;
      reason = "Too soon";
    } else {
      const bufferEnd = addMinutes(endsAt, settings.bufferMinutes);
      for (const b of bookings) {
        const bStart = parseISO(b.startsAt);
        const bEnd = addMinutes(parseISO(b.endsAt), settings.bufferMinutes);
        if (overlaps(startsAt, bufferEnd, bStart, bEnd)) {
          available = false;
          reason = "Booked";
          break;
        }
      }
    }

    slots.push({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      available,
      reason,
    });
  }

  return slots;
}

export async function createBooking(input: {
  user: UserProfile;
  instructorId: string;
  sessionTypeId: string;
  startsAt: string;
  notes?: string;
}): Promise<AppointmentBooking> {
  if (input.user.role !== ROLES.STUDENT) {
    throw new BookingAccessError("Only students can book appointments", 403);
  }

  const settings = getBookingSettings();
  if (!settings.enabled) {
    throw new BookingAccessError("Booking is currently closed by admin", 403);
  }

  const sessionType = settings.sessionTypes.find((t) => t.id === input.sessionTypeId && t.active);
  if (!sessionType) throw new BookingAccessError("Session type not available", 404);

  const instructors = listBookableInstructors();
  if (!instructors.some((i) => i.id === input.instructorId)) {
    throw new BookingAccessError("Instructor not available", 400);
  }

  const startsAt = parseISO(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    throw new BookingAccessError("Invalid startsAt");
  }

  const date = format(startsAt, "yyyy-MM-dd");
  const slots = getAvailableSlots({
    date,
    instructorId: input.instructorId,
    sessionTypeId: input.sessionTypeId,
  });
  const match = slots.find(
    (s) => s.available && parseISO(s.startsAt).getTime() === startsAt.getTime(),
  );
  if (!match) {
    throw new BookingAccessError("Selected slot is not available", 409);
  }

  const now = new Date().toISOString();
  const booking: AppointmentBooking = {
    id: generateId(),
    studentId: input.user.id,
    instructorId: input.instructorId,
    sessionTypeId: sessionType.id,
    sessionTypeName: sessionType.name,
    title: `${sessionType.name} with ${displayName(input.instructorId)}`,
    notes: (input.notes ?? "").trim().slice(0, 500),
    startsAt: match.startsAt,
    endsAt: match.endsAt,
    status: settings.requireConfirmation ? "pending" : "confirmed",
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    cancelledBy: null,
    cancelReason: null,
  };

  writeBookingsDb((db) => {
    // Re-check collision under write lock
    const clash = db.bookings.some(
      (b) =>
        b.instructorId === booking.instructorId &&
        ACTIVE_BOOKING.includes(b.status) &&
        overlaps(
          parseISO(booking.startsAt),
          parseISO(booking.endsAt),
          parseISO(b.startsAt),
          parseISO(b.endsAt),
        ),
    );
    if (clash) throw new BookingAccessError("Selected slot was just taken", 409);
    db.bookings.push(booking);
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.BOOKING_CREATED,
    entityType: "booking",
    entityId: booking.id,
  });

  return booking;
}

export function listMyBookings(user: UserProfile): BookingListItem[] {
  const db = readBookingsDb();
  let rows = db.bookings;
  if (user.role === ROLES.STUDENT) {
    rows = rows.filter((b) => b.studentId === user.id);
  } else if (user.role === ROLES.INSTRUCTOR) {
    rows = rows.filter((b) => b.instructorId === user.id);
  }
  return rows
    .slice()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map(enrichBooking);
}

export function listAllBookings(): BookingListItem[] {
  return readBookingsDb()
    .bookings.slice()
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .map(enrichBooking);
}

function enrichBooking(b: AppointmentBooking): BookingListItem {
  return {
    ...b,
    studentName: displayName(b.studentId),
    instructorName: displayName(b.instructorId),
  };
}

export async function updateBookingStatus(input: {
  user: UserProfile;
  id: string;
  status: BookingStatus;
  cancelReason?: string;
}): Promise<AppointmentBooking> {
  const db = readBookingsDb();
  const existing = db.bookings.find((b) => b.id === input.id);
  if (!existing) throw new BookingAccessError("Booking not found", 404);

  const isAdmin = input.user.role === ROLES.ADMIN || input.user.role === ROLES.SUPER_ADMIN;
  const isOwnerStudent = input.user.role === ROLES.STUDENT && existing.studentId === input.user.id;
  const isInstructor =
    input.user.role === ROLES.INSTRUCTOR && existing.instructorId === input.user.id;

  if (input.status === "cancelled") {
    if (!isAdmin && !isOwnerStudent && !isInstructor) {
      throw new BookingAccessError("Not allowed", 403);
    }
  } else if (!isAdmin) {
    throw new BookingAccessError("Admin access required", 403);
  }

  if (existing.status === "cancelled" || existing.status === "completed") {
    throw new BookingAccessError(`Cannot change a ${existing.status} booking`, 400);
  }

  const now = new Date().toISOString();
  let next: AppointmentBooking = existing;

  writeBookingsDb((d) => {
    const idx = d.bookings.findIndex((b) => b.id === input.id);
    const current = idx >= 0 ? d.bookings[idx] : undefined;
    if (!current) throw new BookingAccessError("Booking not found", 404);
    next = {
      ...current,
      status: input.status,
      updatedAt: now,
      cancelledAt: input.status === "cancelled" ? now : current.cancelledAt,
      cancelledBy: input.status === "cancelled" ? input.user.id : current.cancelledBy,
      cancelReason:
        input.status === "cancelled"
          ? (input.cancelReason ?? "").trim().slice(0, 300)
          : current.cancelReason,
    };
    d.bookings[idx] = next;
  });

  await logActivity({
    actorId: input.user.id,
    action:
      input.status === "cancelled"
        ? ACTIVITY_ACTIONS.BOOKING_CANCELLED
        : ACTIVITY_ACTIONS.BOOKING_UPDATED,
    entityType: "booking",
    entityId: next.id,
  });

  return next;
}
