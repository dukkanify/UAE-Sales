import { NextResponse } from "next/server";
import { getAllViewingBookings } from "@/services/viewing-bookings/viewing-booking-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const bookings = await getAllViewingBookings();
  return NextResponse.json({ bookings });
}
