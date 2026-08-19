import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { notifyViewingBookingStatusChanged } from "@/services/notifications/notification-events";
import { updateViewingBooking } from "@/services/viewing-bookings/viewing-booking-store";
import type { ViewingBooking } from "@/types/domain/viewing-booking";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED: ViewingBooking["status"][] = [
  "pending",
  "confirmed",
  "rescheduled",
  "cancelled",
  "completed",
];

export async function PATCH(request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: ViewingBooking["status"];
    date?: string;
    time?: string;
    actorId?: string;
    actorName?: string;
  };

  if (body.status && !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const booking = await updateViewingBooking(id, {
    status: body.status,
    date: body.date,
    time: body.time,
  });
  if (!booking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  void notifyViewingBookingStatusChanged(booking, "admin");

  await logAdminAction({
    actorId: body.actorId ?? "admin",
    actorName: body.actorName ?? "Admin",
    action: "viewing_status",
    targetType: "viewing_booking",
    targetId: id,
    detail: `الحالة → ${body.status}`,
  });

  return NextResponse.json({ booking });
}
