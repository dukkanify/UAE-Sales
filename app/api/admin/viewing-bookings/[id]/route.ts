import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { updateViewingBookingStatus } from "@/services/viewing-bookings/viewing-booking-store";
import type { ViewingBooking } from "@/types/domain/viewing-booking";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED: ViewingBooking["status"][] = ["confirmed", "cancelled"];

export async function PATCH(request: Request, { params }: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: ViewingBooking["status"];
    actorId?: string;
    actorName?: string;
  };

  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const booking = await updateViewingBookingStatus(id, body.status);
  if (!booking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

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
