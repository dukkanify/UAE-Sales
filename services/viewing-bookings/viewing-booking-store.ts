import type { ViewingBooking } from "@/types/domain/viewing-booking";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const FILE = "viewing-bookings.json";

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export function getViewingTimeSlots(): string[] {
  return TIME_SLOTS;
}

export function getAvailableViewingDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let offset = 1; offset <= 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

export async function getViewingBookingsForListing(
  listingId: string,
): Promise<ViewingBooking[]> {
  const all = await loadCollection<ViewingBooking>(FILE);
  return all.filter(
    (item) =>
      item.listingId === listingId &&
      (item.status === "pending" ||
        item.status === "confirmed" ||
        item.status === "rescheduled"),
  );
}

export async function getAvailableSlotsForListing(
  listingId: string,
  date: string,
): Promise<string[]> {
  const booked = await getViewingBookingsForListing(listingId);
  const taken = new Set(
    booked.filter((item) => item.date === date).map((item) => item.time),
  );
  return TIME_SLOTS.filter((slot) => !taken.has(slot));
}

export async function getViewingBookingsForUser(
  userId: string,
): Promise<ViewingBooking[]> {
  const all = await loadCollection<ViewingBooking>(FILE);
  return all.filter(
    (item) => item.buyerId === userId || item.sellerId === userId,
  );
}

export async function getAllViewingBookings(): Promise<ViewingBooking[]> {
  return loadCollection<ViewingBooking>(FILE);
}

export async function getViewingBookingById(
  id: string,
): Promise<ViewingBooking | undefined> {
  const all = await loadCollection<ViewingBooking>(FILE);
  return all.find((item) => item.id === id);
}

export async function findViewingBooking(
  buyerId: string,
  listingId: string,
  date: string,
  time: string,
): Promise<ViewingBooking | undefined> {
  const all = await loadCollection<ViewingBooking>(FILE);
  return all.find(
    (item) =>
      item.buyerId === buyerId &&
      item.listingId === listingId &&
      item.date === date &&
      item.time === time &&
      item.status === "pending" ||
      item.status === "confirmed" ||
      item.status === "rescheduled",
  );
}

export async function createViewingBooking(
  input: Omit<ViewingBooking, "id" | "status" | "createdAt">,
): Promise<ViewingBooking> {
  const all = await loadCollection<ViewingBooking>(FILE);
  const booking: ViewingBooking = {
    ...input,
    id: `view-${Date.now()}`,
    status: "pending",
    statusVersion: 1,
    createdAt: new Date().toISOString(),
  };
  all.unshift(booking);
  await saveCollection(FILE, all);
  return booking;
}

export async function updateViewingBooking(
  id: string,
  patch: Partial<Pick<ViewingBooking, "status" | "date" | "time" | "notes">>,
): Promise<ViewingBooking | undefined> {
  const all = await loadCollection<ViewingBooking>(FILE);
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  const current = all[index];
  const nextStatus = patch.status ?? current.status;
  const rescheduled =
    (patch.date && patch.date !== current.date) ||
    (patch.time && patch.time !== current.time);
  all[index] = {
    ...current,
    ...patch,
    status: rescheduled && nextStatus === "confirmed" ? "rescheduled" : nextStatus,
    statusVersion: (current.statusVersion ?? 1) + 1,
  };
  await saveCollection(FILE, all);
  return all[index];
}

export async function updateViewingBookingStatus(
  id: string,
  status: ViewingBooking["status"],
): Promise<ViewingBooking | undefined> {
  return updateViewingBooking(id, { status });
}
