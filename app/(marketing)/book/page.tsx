import type { Metadata } from "next";

import { PublicBookingStudio } from "@/features/bookings/components/public-booking-studio";

export const metadata: Metadata = {
  title: "Book a Zoom session",
  description: "Reserve your ATPL PASS Zoom appointment before registering — confirm by email OTP.",
};

export default function PublicBookPage() {
  return (
    <div className="container-app">
      <PublicBookingStudio />
    </div>
  );
}
