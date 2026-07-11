import { NextResponse } from "next/server";
import {
  getAvailableSlotsForListing,
  getAvailableViewingDates,
  getViewingTimeSlots,
} from "@/services/viewing-bookings/viewing-booking-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const listingId = url.searchParams.get("listingId");
  const date = url.searchParams.get("date");

  if (!listingId) {
    return NextResponse.json({
      dates: getAvailableViewingDates(),
      timeSlots: getViewingTimeSlots(),
    });
  }

  if (!date) {
    return NextResponse.json({ dates: getAvailableViewingDates() });
  }

  const slots = await getAvailableSlotsForListing(listingId, date);
  return NextResponse.json({ slots });
}
