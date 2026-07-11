import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification } from "@/services/payments/notification-store";
import {
  createViewingBooking,
  findViewingBooking,
  getAvailableSlotsForListing,
  getViewingBookingsForUser,
} from "@/services/viewing-bookings/viewing-booking-store";

const schema = z.object({
  listingId: z.string().min(1),
  listingTitle: z.string().min(1),
  listingSlug: z.string().optional(),
  buyerId: z.string().min(1),
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  phone: z.string().min(8),
  date: z.string().min(1),
  time: z.string().min(1),
  visitors: z.number().min(1).max(10),
  notes: z.string().optional(),
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const available = await getAvailableSlotsForListing(
    parsed.data.listingId,
    parsed.data.date,
  );
  if (!available.includes(parsed.data.time)) {
    return NextResponse.json({ error: "SLOT_UNAVAILABLE" }, { status: 409 });
  }

  const existing = await findViewingBooking(
    parsed.data.buyerId,
    parsed.data.listingId,
    parsed.data.date,
    parsed.data.time,
  );
  if (existing) {
    return NextResponse.json({ error: "DUPLICATE_BOOKING" }, { status: 409 });
  }

  const booking = await createViewingBooking(parsed.data);

  await Promise.all([
    createNotification({
      userId: parsed.data.buyerId,
      type: "viewing_booking",
      title: "تم تأكيد حجز المعاينة",
      body: `معاينة «${parsed.data.listingTitle}» بتاريخ ${parsed.data.date} الساعة ${parsed.data.time}.`,
    }),
    createNotification({
      userId: parsed.data.sellerId,
      type: "viewing_booking",
      title: "حجز معاينة جديد",
      body: `${parsed.data.buyerName} حجز معاينة لـ «${parsed.data.listingTitle}».`,
    }),
  ]);

  return NextResponse.json({ booking });
}

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const bookings = await getViewingBookingsForUser(userId);
  return NextResponse.json({ bookings });
}
