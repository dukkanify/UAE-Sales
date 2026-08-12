import { addDays, format, isValid, parseISO } from "date-fns";

import type { BookingSlot } from "@/types/bookings";

/** Public booking studio always shows Greenwich Mean Time. */
export const BOOKING_DISPLAY_TIMEZONE = "GMT";

export type ResolvedBookableDay = {
  date: string;
  slots: BookingSlot[];
  autoAdvanced: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Safe HH:mm GMT label — invalid dates must never crash the booking UI. */
export function formatSlotTime(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return "--:--";
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
}

export function formatSlotDateTime(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return "Invalid time";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()] ?? "";
  const month =
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
      date.getUTCMonth()
    ] ?? "";
  return `${weekday} ${date.getUTCDate()} ${month} · ${formatSlotTime(iso)} GMT`;
}

export function utcHourFromIso(iso: string): number {
  const date = parseISO(iso);
  if (!isValid(date)) return 0;
  return date.getUTCHours();
}

export function hasAvailableSlot(slots: BookingSlot[]): boolean {
  return slots.some((slot) => slot.available);
}

export function maxBookableDate(maxAdvanceDays: number): string {
  const days = Math.max(1, Math.min(maxAdvanceDays || 30, 60));
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}

/**
 * Client-side fallback for older bundles that still import this helper.
 * Prefer server `findNext=1` for speed.
 */
export async function resolveBookableDate(input: {
  startDate: string;
  maxAdvanceDays: number;
  loadSlots: (date: string) => Promise<BookingSlot[]>;
}): Promise<ResolvedBookableDay> {
  const max = Math.max(1, Math.min(input.maxAdvanceDays || 14, 60));
  let cursor = input.startDate;
  let slots = await input.loadSlots(cursor);
  if (hasAvailableSlot(slots)) {
    return { date: cursor, slots, autoAdvanced: false };
  }

  for (let i = 1; i <= max; i += 1) {
    cursor = format(addDays(parseISO(`${input.startDate}T12:00:00`), i), "yyyy-MM-dd");
    slots = await input.loadSlots(cursor);
    if (hasAvailableSlot(slots)) {
      return { date: cursor, slots, autoAdvanced: true };
    }
  }

  return {
    date: input.startDate,
    slots: await input.loadSlots(input.startDate),
    autoAdvanced: false,
  };
}
