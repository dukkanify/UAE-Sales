import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getBookingSettings, updateBookingSettings } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    return NextResponse.json({
      success: true,
      data: getBookingSettings(),
      error: null,
    });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.BOOKINGS_MANAGE);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const data = await updateBookingSettings({ user, patch: body });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
