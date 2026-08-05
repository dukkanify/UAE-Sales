import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { updateBookingStatus } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/bookings";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    const { id } = await ctx.params;
    const body = (await request.json().catch(() => null)) as {
      status?: BookingStatus;
      cancelReason?: string;
    } | null;

    if (!body?.status || !BOOKING_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, data: null, error: "Valid status required" },
        { status: 400 },
      );
    }

    const data = await updateBookingStatus({
      user,
      id,
      status: body.status,
      cancelReason: body.cancelReason,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
