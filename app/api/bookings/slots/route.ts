import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getAvailableSlots, listBookableInstructors } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const instructorId = searchParams.get("instructorId");
    const sessionTypeId = searchParams.get("sessionTypeId");

    if (searchParams.get("meta") === "1") {
      return NextResponse.json({
        success: true,
        data: { instructors: listBookableInstructors() },
        error: null,
      });
    }

    if (!date || !instructorId || !sessionTypeId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "date, instructorId, and sessionTypeId are required",
        },
        { status: 400 },
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
