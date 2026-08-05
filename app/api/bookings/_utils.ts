import { NextResponse } from "next/server";

import { BookingAccessError } from "@/services/bookings/access";
import { authErrorResponse } from "@/services/auth/guards";

export function bookingErrorResponse(error: unknown) {
  if (error instanceof BookingAccessError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return authErrorResponse(error);
}
