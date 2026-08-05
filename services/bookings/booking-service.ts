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
  BookingJoinPayload,
  BookingListItem,
  BookingSettings,
  BookingSlot,
  BookingStatus,
  BookingZoomSession,
  PublicBookingCatalog,
} from "@/types/bookings";
import type { UserProfile } from "@/types";
import {
  cancelStandaloneZoomMeeting,
  provisionStandaloneZoomMeeting,
} from "@/services/classes/zoom-service";

const ACTIVE_BOOKING: BookingStatus[] = ["pending", "confirmed"];
const GUEST_HOLD_TTL_MS = 15 * 60_000;

function buildUserNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const u of readAuthDb().users) {
    map.set(u.id, `${u.firstName} ${u.lastName}`.trim() || u.email);
  }
  return map;
}

function displayName(userId: string | null | undefined, names?: Map<string, string>): string {
  if (!userId) return "Guest";
  if (names) return names.get(userId) ?? "Unknown";
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) return "Unknown";
  return `${u.firstName} ${u.lastName}`.trim() || u.email;
}

/** Cancel abandoned guest holds so slots free up quickly. */
function purgeExpiredGuestHolds(): void {
  const cutoff = Date.now() - GUEST_HOLD_TTL_MS;
  const db = readBookingsDb();
  const hasExpired = db.bookings.some(
    (b) =>
      b.status === "pending" &&
      b.guestEmail &&
      !b.guestVerified &&
      Date.parse(b.createdAt) < cutoff,
  );
  if (!hasExpired) return;

  const now = new Date().toISOString();
  writeBookingsDb((draft) => {
    draft.bookings = draft.bookings.map((b) => {
      if (
        b.status === "pending" &&
        b.guestEmail &&
        !b.guestVerified &&
        Date.parse(b.createdAt) < cutoff
      ) {
        return {
          ...b,
          status: "cancelled" as const,
          cancelledAt: now,
          cancelReason: "Hold expired",
          updatedAt: now,
        };
      }
      return b;
    });
  });
}

function normalizeBooking(b: AppointmentBooking): AppointmentBooking {
  return {
    ...b,
    studentId: b.studentId ?? null,
    zoom: b.zoom ?? null,
    guestEmail: b.guestEmail ?? null,
    guestFirstName: b.guestFirstName ?? null,
    guestLastName: b.guestLastName ?? null,
    guestVerified: Boolean(b.guestVerified),
  };
}

async function provisionZoomForBooking(
  booking: AppointmentBooking,
  actorId: string,
): Promise<BookingZoomSession> {
  const settings = getBookingSettings();
  const duration = Math.max(
    15,
    Math.round((Date.parse(booking.endsAt) - Date.parse(booking.startsAt)) / 60_000),
  );
  const meeting = await provisionStandaloneZoomMeeting({
    topic: booking.title,
    agenda: booking.notes || `${booking.sessionTypeName} appointment`,
    startsAt: booking.startsAt,
    durationMinutes: duration,
    timezone: settings.timezone,
    mockJoinPath: `/bookings/join/${booking.id}`,
    waitingRoom: settings.zoomWaitingRoom,
    passcode: settings.zoomPasscode,
    actorId,
  });
  return {
    meetingNumber: meeting.meetingNumber,
    joinUrl: meeting.joinUrl,
    startUrl: meeting.startUrl,
    password: meeting.password,
    waitingRoom: meeting.waitingRoom,
    providerMode: meeting.providerMode,
    provisionedAt: new Date().toISOString(),
  };
}

export async function ensureBookingZoom(
  bookingId: string,
  actorId: string,
): Promise<AppointmentBooking> {
  const existing = readBookingsDb().bookings.find((b) => b.id === bookingId);
  if (!existing) throw new BookingAccessError("Booking not found", 404);
  if (existing.zoom) return normalizeBooking(existing);
  if (existing.status !== "confirmed" && existing.status !== "pending") {
    throw new BookingAccessError("Zoom is only available for active bookings", 400);
  }

  const settings = getBookingSettings();
  if (!settings.autoCreateZoom && existing.status !== "confirmed") {
    throw new BookingAccessError("Zoom not provisioned yet", 400);
  }

  const zoom = await provisionZoomForBooking(existing, actorId);
  let next = existing;
  writeBookingsDb((d) => {
    const idx = d.bookings.findIndex((b) => b.id === bookingId);
    if (idx < 0) return;
    next = { ...d.bookings[idx]!, zoom, updatedAt: new Date().toISOString() };
    d.bookings[idx] = next;
  });
  return normalizeBooking(next);
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
  /** Skip hold purge when scanning many days in one request */
  skipPurge?: boolean;
}): BookingSlot[] {
  if (!input.skipPurge) purgeExpiredGuestHolds();

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

/** One server pass — next day with open slots (avoids N HTTP round-trips). */
export function findNextAvailableSlots(input: {
  startDate: string;
  instructorId: string;
  sessionTypeId: string;
  maxDays?: number;
}): { date: string; slots: BookingSlot[]; autoAdvanced: boolean } {
  purgeExpiredGuestHolds();
  const settings = getBookingSettings();
  const max = Math.max(1, Math.min(input.maxDays ?? settings.maxAdvanceDays, 60));

  for (let i = 0; i <= max; i += 1) {
    const date = format(addDays(parseISO(`${input.startDate}T12:00:00`), i), "yyyy-MM-dd");
    const slots = getAvailableSlots({
      date,
      instructorId: input.instructorId,
      sessionTypeId: input.sessionTypeId,
      skipPurge: true,
    });
    if (slots.some((s) => s.available)) {
      return { date, slots, autoAdvanced: i > 0 };
    }
  }

  const slots = getAvailableSlots({
    date: input.startDate,
    instructorId: input.instructorId,
    sessionTypeId: input.sessionTypeId,
    skipPurge: true,
  });
  return { date: input.startDate, slots, autoAdvanced: false };
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
  const status: BookingStatus = settings.requireConfirmation ? "pending" : "confirmed";
  let booking: AppointmentBooking = {
    id: generateId(),
    studentId: input.user.id,
    instructorId: input.instructorId,
    sessionTypeId: sessionType.id,
    sessionTypeName: sessionType.name,
    title: `${sessionType.name} with ${displayName(input.instructorId)}`,
    notes: (input.notes ?? "").trim().slice(0, 500),
    startsAt: match.startsAt,
    endsAt: match.endsAt,
    status,
    zoom: null,
    guestEmail: null,
    guestFirstName: null,
    guestLastName: null,
    guestVerified: true,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    cancelledBy: null,
    cancelReason: null,
  };

  writeBookingsDb((db) => {
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

  if (status === "confirmed" && settings.autoCreateZoom) {
    const zoom = await provisionZoomForBooking(booking, input.user.id);
    writeBookingsDb((db) => {
      const idx = db.bookings.findIndex((b) => b.id === booking.id);
      if (idx >= 0) {
        booking = { ...db.bookings[idx]!, zoom, updatedAt: new Date().toISOString() };
        db.bookings[idx] = booking;
      }
    });
  }

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.BOOKING_CREATED,
    entityType: "booking",
    entityId: booking.id,
  });

  return normalizeBooking(booking);
}

export function listMyBookings(user: UserProfile): BookingListItem[] {
  const db = readBookingsDb();
  const names = buildUserNameMap();
  let rows = db.bookings;
  if (user.role === ROLES.STUDENT) {
    rows = rows.filter((b) => b.studentId === user.id);
  } else if (user.role === ROLES.INSTRUCTOR) {
    rows = rows.filter((b) => b.instructorId === user.id);
  }
  return rows
    .slice()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((b) => enrichBooking(b, names));
}

export function listAllBookings(): BookingListItem[] {
  const names = buildUserNameMap();
  return readBookingsDb()
    .bookings.slice()
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .map((b) => enrichBooking(b, names));
}

export function enrichBooking(b: AppointmentBooking, names?: Map<string, string>): BookingListItem {
  const n = normalizeBooking(b);
  const guestLabel = [n.guestFirstName, n.guestLastName].filter(Boolean).join(" ").trim();
  const nameMap = names ?? buildUserNameMap();
  return {
    ...n,
    studentName: n.studentId
      ? displayName(n.studentId, nameMap)
      : guestLabel || n.guestEmail || "Guest",
    instructorName: displayName(n.instructorId, nameMap),
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
  let next: AppointmentBooking = normalizeBooking(existing);
  const settings = getBookingSettings();

  writeBookingsDb((d) => {
    const idx = d.bookings.findIndex((b) => b.id === input.id);
    const current = idx >= 0 ? normalizeBooking(d.bookings[idx]!) : undefined;
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

  if (input.status === "confirmed" && settings.autoCreateZoom && !next.zoom) {
    const zoom = await provisionZoomForBooking(next, input.user.id);
    writeBookingsDb((d) => {
      const idx = d.bookings.findIndex((b) => b.id === next.id);
      if (idx >= 0) {
        next = { ...d.bookings[idx]!, zoom, updatedAt: new Date().toISOString() };
        d.bookings[idx] = next;
      }
    });
  }

  if (input.status === "cancelled" && next.zoom) {
    await cancelStandaloneZoomMeeting({
      meetingNumber: next.zoom.meetingNumber,
      providerMode: next.zoom.providerMode,
      actorId: input.user.id,
    });
  }

  await logActivity({
    actorId: input.user.id,
    action:
      input.status === "cancelled"
        ? ACTIVITY_ACTIONS.BOOKING_CANCELLED
        : ACTIVITY_ACTIONS.BOOKING_UPDATED,
    entityType: "booking",
    entityId: next.id,
  });

  return normalizeBooking(next);
}

export async function getBookingJoinInfo(input: {
  user: UserProfile;
  bookingId: string;
}): Promise<BookingJoinPayload> {
  let booking = readBookingsDb().bookings.find((b) => b.id === input.bookingId);
  if (!booking) throw new BookingAccessError("Booking not found", 404);
  booking = normalizeBooking(booking);

  const isAdmin = input.user.role === ROLES.ADMIN || input.user.role === ROLES.SUPER_ADMIN;
  const isStudent = booking.studentId === input.user.id;
  const isHost = booking.instructorId === input.user.id || isAdmin;

  if (!isStudent && !isHost) {
    throw new BookingAccessError("You are not invited to this Zoom session", 403);
  }

  if (booking.status === "cancelled") {
    throw new BookingAccessError("This booking was cancelled", 410);
  }

  if (booking.status === "pending") {
    throw new BookingAccessError("Booking awaits admin confirmation before Zoom opens", 403);
  }

  if (!booking.zoom) {
    booking = await ensureBookingZoom(booking.id, input.user.id);
  }

  const zoom = booking.zoom;
  if (!zoom) throw new BookingAccessError("Zoom session unavailable", 500);

  const starts = Date.parse(booking.startsAt);
  const ends = Date.parse(booking.endsAt);
  const now = Date.now();
  const openAt = starts - 15 * 60_000;
  const withinWindow = now >= openAt && now <= ends + 30 * 60_000;
  const canJoin = booking.status === "confirmed";
  const joinWindowLabel =
    now < openAt
      ? "Lobby open — Zoom recommended from 15 minutes before start"
      : now > ends + 30 * 60_000
        ? "Scheduled window ended — host may still reopen"
        : withinWindow
          ? "Live window — enter Zoom now"
          : "Zoom room ready";

  return {
    booking: enrichBooking(booking),
    join: {
      meetingNumber: zoom.meetingNumber,
      joinUrl: zoom.joinUrl,
      startUrl: isHost ? zoom.startUrl : null,
      password: zoom.password,
      waitingRoom: zoom.waitingRoom,
      providerMode: zoom.providerMode,
    },
    isHost,
    canJoin,
    joinWindowLabel,
  };
}

export function getPublicBookingCatalog(): PublicBookingCatalog {
  const settings = getBookingSettings();
  return {
    enabled: settings.enabled,
    allowGuestBooking: settings.allowGuestBooking,
    aroundTheClock: settings.aroundTheClock,
    maxAdvanceDays: settings.maxAdvanceDays,
    autoCreateZoom: settings.autoCreateZoom,
    requireConfirmation: settings.requireConfirmation,
    timezone: settings.timezone,
    sessionTypes: settings.sessionTypes.filter((t) => t.active),
    instructors: listBookableInstructors().map((i) => ({
      id: i.id,
      fullName: i.fullName || i.email,
      firstName: i.firstName,
      lastName: i.lastName,
    })),
  };
}

export async function createGuestBookingHold(input: {
  email: string;
  firstName: string;
  lastName: string;
  instructorId: string;
  sessionTypeId: string;
  startsAt: string;
  notes?: string;
}): Promise<{ booking: AppointmentBooking; email: string }> {
  const settings = getBookingSettings();
  if (!settings.enabled) {
    throw new BookingAccessError("Booking is currently closed", 403);
  }
  if (!settings.allowGuestBooking) {
    throw new BookingAccessError("Guest booking is disabled — please sign in first", 403);
  }

  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!email || !email.includes("@")) throw new BookingAccessError("Valid email required");
  if (!firstName || !lastName) throw new BookingAccessError("First and last name required");

  const existingUser = readAuthDb().users.find((u) => u.email === email);
  if (existingUser && existingUser.role !== ROLES.STUDENT) {
    throw new BookingAccessError("This email belongs to a staff account — sign in instead", 400);
  }
  if (
    existingUser?.status === ACCOUNT_STATUS.SUSPENDED ||
    existingUser?.status === ACCOUNT_STATUS.INACTIVE
  ) {
    throw new BookingAccessError("This account cannot book right now", 403);
  }

  const sessionType = settings.sessionTypes.find((t) => t.id === input.sessionTypeId && t.active);
  if (!sessionType) throw new BookingAccessError("Session type not available", 404);

  const instructors = listBookableInstructors();
  if (!instructors.some((i) => i.id === input.instructorId)) {
    throw new BookingAccessError("Instructor not available", 400);
  }

  const startsAt = parseISO(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) throw new BookingAccessError("Invalid startsAt");

  const date = format(startsAt, "yyyy-MM-dd");
  const slots = getAvailableSlots({
    date,
    instructorId: input.instructorId,
    sessionTypeId: input.sessionTypeId,
  });
  const match = slots.find(
    (s) => s.available && parseISO(s.startsAt).getTime() === startsAt.getTime(),
  );
  if (!match) throw new BookingAccessError("Selected slot is not available", 409);

  const now = new Date().toISOString();
  const booking: AppointmentBooking = {
    id: generateId(),
    studentId: existingUser?.id ?? null,
    instructorId: input.instructorId,
    sessionTypeId: sessionType.id,
    sessionTypeName: sessionType.name,
    title: `${sessionType.name} with ${displayName(input.instructorId)}`,
    notes: (input.notes ?? "").trim().slice(0, 500),
    startsAt: match.startsAt,
    endsAt: match.endsAt,
    status: "pending",
    zoom: null,
    guestEmail: email,
    guestFirstName: firstName,
    guestLastName: lastName,
    guestVerified: false,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    cancelledBy: null,
    cancelReason: null,
  };

  writeBookingsDb((db) => {
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
    actorId: existingUser?.id ?? null,
    action: ACTIVITY_ACTIONS.BOOKING_CREATED,
    entityType: "booking",
    entityId: booking.id,
    metadata: { guest: true, email },
  });

  return { booking: normalizeBooking(booking), email };
}

export async function finalizeGuestBooking(input: {
  bookingId: string;
  userId: string;
}): Promise<AppointmentBooking> {
  const settings = getBookingSettings();
  let booking = readBookingsDb().bookings.find((b) => b.id === input.bookingId);
  if (!booking) throw new BookingAccessError("Booking not found", 404);
  booking = normalizeBooking(booking);

  if (
    booking.guestVerified &&
    booking.studentId === input.userId &&
    booking.status === "confirmed"
  ) {
    return booking;
  }

  const status: BookingStatus = settings.requireConfirmation ? "pending" : "confirmed";
  let next = booking;

  writeBookingsDb((d) => {
    const idx = d.bookings.findIndex((b) => b.id === input.bookingId);
    if (idx < 0) throw new BookingAccessError("Booking not found", 404);
    next = {
      ...normalizeBooking(d.bookings[idx]!),
      studentId: input.userId,
      guestVerified: true,
      status,
      updatedAt: new Date().toISOString(),
    };
    d.bookings[idx] = next;
  });

  if (status === "confirmed" && settings.autoCreateZoom && !next.zoom) {
    const zoom = await provisionZoomForBooking(next, input.userId);
    writeBookingsDb((d) => {
      const idx = d.bookings.findIndex((b) => b.id === next.id);
      if (idx >= 0) {
        next = { ...d.bookings[idx]!, zoom, updatedAt: new Date().toISOString() };
        d.bookings[idx] = next;
      }
    });
  }

  await logActivity({
    actorId: input.userId,
    action: ACTIVITY_ACTIONS.BOOKING_UPDATED,
    entityType: "booking",
    entityId: next.id,
    metadata: { guestFinalized: true, status },
  });

  return normalizeBooking(next);
}
