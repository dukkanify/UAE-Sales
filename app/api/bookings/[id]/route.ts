import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { enrichBooking, updateBookingStatus } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/bookings";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

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

    const updated = await updateBookingStatus({
      user,
      id,
      status: body.status,
      cancelReason: body.cancelReason,
    });
    return NextResponse.json({ success: true, data: enrichBooking(updated), error: null });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
