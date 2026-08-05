import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { getBookingJoinInfo } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, ctx: Ctx) {
  try {
    const user = await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    const { id } = await ctx.params;
    const data = await getBookingJoinInfo({ user, bookingId: id });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
