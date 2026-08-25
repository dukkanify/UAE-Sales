import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";
import { requirePermission } from "@/services/auth/guards";
import { confirmBookingPayment } from "@/services/bookings/booking-service";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { paymentOrderId?: string };
    const booking = await confirmBookingPayment({
      bookingId: id,
      userId: user.id,
      paymentOrderId: body.paymentOrderId,
    });
    return NextResponse.json({ success: true, data: booking, error: null });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
