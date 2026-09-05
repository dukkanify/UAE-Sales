import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAllViewingBookings } from "@/services/viewing-bookings/viewing-booking-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  const bookings = await getAllViewingBookings();
  return NextResponse.json({ bookings });
}
