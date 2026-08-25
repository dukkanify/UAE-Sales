import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requirePermission } from "@/services/auth/guards";
import {
  createBooking,
  listAllBookings,
  listMyBookings,
} from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

export async function GET() {
  try {
    const user = await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
      await requirePermission(PERMISSIONS.BOOKINGS_MANAGE);
      return NextResponse.json({
        success: true,
        data: listAllBookings(),
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: listMyBookings(user),
      error: null,
    });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requirePermission(PERMISSIONS.BOOKINGS_OWN);
    const body = (await request.json().catch(() => null)) as {
      instructorId?: string;
      sessionTypeId?: string;
      startsAt?: string;
      notes?: string;
    } | null;

    if (!body?.instructorId || !body.sessionTypeId || !body.startsAt) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "instructorId, sessionTypeId, and startsAt are required",
        },
        { status: 400 },
      );
    }

    const data = await createBooking({
      user,
      instructorId: body.instructorId,
      sessionTypeId: body.sessionTypeId,
      startsAt: body.startsAt,
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data, error: null }, { status: 201 });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
