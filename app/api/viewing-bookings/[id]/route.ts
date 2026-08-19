import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireSessionUser } from "@/services/auth/require-session";
import { notifyViewingBookingStatusChanged } from "@/services/notifications/notification-events";
import {
  getViewingBookingById,
  updateViewingBooking,
} from "@/services/viewing-bookings/viewing-booking-store";
import type { ViewingBookingStatus } from "@/types/domain/viewing-booking";

type RouteParams = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z
    .enum(["pending", "confirmed", "rescheduled", "cancelled", "completed"])
    .optional(),
  date: z.string().min(1).optional(),
  time: z.string().min(1).optional(),
  notes: z.string().max(500).optional(),
});

const ALLOWED: ViewingBookingStatus[] = [
  "pending",
  "confirmed",
  "rescheduled",
  "cancelled",
  "completed",
];

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireSessionUser();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const current = await getViewingBookingById(id);
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isParty =
    session.id === current.sellerId ||
    session.id === current.buyerId ||
    session.role === "admin";
  if (!isParty) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  if (parsed.data.status && !ALLOWED.includes(parsed.data.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const booking = await updateViewingBooking(id, parsed.data);
  if (!booking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const actor =
    session.role === "admin"
      ? "admin"
      : session.id === current.sellerId
        ? "seller"
        : "system";
  void notifyViewingBookingStatusChanged(booking, actor);

  return NextResponse.json({ booking });
}
