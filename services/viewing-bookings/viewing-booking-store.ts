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
    (item) => item.listingId === listingId && item.status === "confirmed",
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
  return all.filter((item) => item.buyerId === userId);
}

export async function getAllViewingBookings(): Promise<ViewingBooking[]> {
  return loadCollection<ViewingBooking>(FILE);
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
      item.status === "confirmed",
  );
}

export async function createViewingBooking(
  input: Omit<ViewingBooking, "id" | "status" | "createdAt">,
): Promise<ViewingBooking> {
  const all = await loadCollection<ViewingBooking>(FILE);
  const booking: ViewingBooking = {
    ...input,
    id: `view-${Date.now()}`,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  all.unshift(booking);
  await saveCollection(FILE, all);
  return booking;
}

export async function updateViewingBookingStatus(
  id: string,
  status: ViewingBooking["status"],
): Promise<ViewingBooking | undefined> {
  const all = await loadCollection<ViewingBooking>(FILE);
  const index = all.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  all[index] = { ...all[index], status };
  await saveCollection(FILE, all);
  return all[index];
}
