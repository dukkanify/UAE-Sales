import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification } from "@/services/payments/notification-store";
import {
  assertNotOwnListing,
  resolveServerListing,
  validateFutureDate,
} from "@/services/listings/listing-action-resolver";
import {
  createViewingBooking,
  findViewingBooking,
  getAvailableSlotsForListing,
  getAvailableViewingDates,
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

  const allowedDates = getAvailableViewingDates();
  if (!allowedDates.includes(parsed.data.date) || !validateFutureDate(parsed.data.date)) {
    return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
  }

  const listing = resolveServerListing(parsed.data.listingId);
  if (listing && listing.categoryId !== "real-estate") {
    return NextResponse.json({ error: "INVALID_LISTING_TYPE" }, { status: 400 });
  }

  const ownError = assertNotOwnListing(
    listing,
    parsed.data.buyerId,
    parsed.data.sellerId,
  );
  if (ownError) {
    return NextResponse.json({ error: ownError }, { status: 403 });
  }

  const payload = { ...parsed.data };

  if (listing) {
    payload.sellerId = listing.seller.id;
    payload.sellerName = listing.seller.name;
    payload.listingTitle = listing.title;
    payload.listingSlug = listing.slug;
  }

  const available = await getAvailableSlotsForListing(
    payload.listingId,
    payload.date,
  );
  if (!available.includes(payload.time)) {
    return NextResponse.json({ error: "SLOT_UNAVAILABLE" }, { status: 409 });
  }

  const existing = await findViewingBooking(
    payload.buyerId,
    payload.listingId,
    payload.date,
    payload.time,
  );
  if (existing) {
    return NextResponse.json({ error: "DUPLICATE_BOOKING" }, { status: 409 });
  }

  const booking = await createViewingBooking(payload);

  await Promise.all([
    createNotification({
      userId: payload.buyerId,
      type: "viewing_booking",
      title: "تم تأكيد حجز المعاينة",
      body: `معاينة «${payload.listingTitle}» بتاريخ ${payload.date} الساعة ${payload.time}.`,
    }),
    createNotification({
      userId: payload.sellerId,
      type: "viewing_booking",
      title: "حجز معاينة جديد",
      body: `${payload.buyerName} حجز معاينة لـ «${payload.listingTitle}».`,
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
