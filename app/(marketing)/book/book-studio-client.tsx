"use client";

import { PublicBookingStudio } from "@/features/bookings/components/public-booking-studio";

/** Client boundary for /book — avoids next/dynamic export glitches under HMR. */
export function BookStudioClient() {
  return <PublicBookingStudio />;
}
