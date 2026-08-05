import { NextResponse } from "next/server";

import { getAvailableSlots, getPublicBookingCatalog } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";
import { ensureCsrfToken } from "@/lib/security/cookies";

export async function GET(request: Request) {
  try {
    await ensureCsrfToken();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const instructorId = searchParams.get("instructorId");
    const sessionTypeId = searchParams.get("sessionTypeId");

    if (!date && !instructorId && !sessionTypeId) {
      return NextResponse.json({
        success: true,
        data: getPublicBookingCatalog(),
        error: null,
      });
    }

    if (!date || !instructorId || !sessionTypeId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "date, instructorId, and sessionTypeId are required for slots",
        },
        { status: 400 },
      );
    }

    const catalog = getPublicBookingCatalog();
    if (!catalog.enabled || !catalog.allowGuestBooking) {
      return NextResponse.json(
        { success: false, data: null, error: "Public booking is unavailable" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: getAvailableSlots({ date, instructorId, sessionTypeId }),
      error: null,
    });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
