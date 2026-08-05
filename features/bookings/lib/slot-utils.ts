import { addDays, format, isValid, parseISO } from "date-fns";

import type { BookingSlot } from "@/types/bookings";

export type ResolvedBookableDay = {
  date: string;
  slots: BookingSlot[];
  autoAdvanced: boolean;
};

/** Safe HH:mm label — invalid dates must never crash the booking UI. */
export function formatSlotTime(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return "--:--";
  return format(date, "HH:mm");
}

export function formatSlotDateTime(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return "Invalid time";
  return date.toLocaleString();
}

export function hasAvailableSlot(slots: BookingSlot[]): boolean {
  return slots.some((slot) => slot.available);
}

export function maxBookableDate(maxAdvanceDays: number): string {
  const days = Math.max(1, Math.min(maxAdvanceDays || 30, 60));
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}
