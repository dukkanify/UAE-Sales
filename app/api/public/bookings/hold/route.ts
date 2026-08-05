import { NextResponse } from "next/server";

import { requestOtp } from "@/services/auth/auth-service";
import { getRequestContext } from "@/services/auth/guards";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { createGuestBookingHold } from "@/services/bookings/booking-service";
import { bookingErrorResponse } from "@/app/api/bookings/_utils";

export async function POST(request: Request) {
  try {
    await ensureCsrfToken();
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      firstName?: string;
      lastName?: string;
      instructorId?: string;
      sessionTypeId?: string;
      startsAt?: string;
      notes?: string;
    } | null;

    if (
      !body?.email ||
      !body.firstName ||
      !body.lastName ||
      !body.instructorId ||
      !body.sessionTypeId ||
      !body.startsAt
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "email, firstName, lastName, instructorId, sessionTypeId, and startsAt are required",
        },
        { status: 400 },
      );
    }

    const { booking, email } = await createGuestBookingHold({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      instructorId: body.instructorId,
      sessionTypeId: body.sessionTypeId,
      startsAt: body.startsAt,
      notes: body.notes,
    });

    const otp = await requestOtp({
      email,
      purpose: "booking",
      bookingId: booking.id,
      firstName: body.firstName,
      lastName: body.lastName,
      rememberMe: true,
      ctx: getRequestContext(request),
    });

    if (!otp.success) {
      return NextResponse.json(
        { success: false, data: null, error: otp.error ?? "Could not send verification code" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        email,
        expiresInMinutes: otp.data?.expiresInMinutes,
        demoOtp: otp.data?.demoOtp,
        startsAt: booking.startsAt,
        title: booking.title,
      },
      error: null,
    });
  } catch (error) {
    return bookingErrorResponse(error);
  }
}
