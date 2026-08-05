"use client";

import dynamic from "next/dynamic";

const PublicBookingStudio = dynamic(
  () =>
    import("@/features/bookings/components/public-booking-studio").then(
      (m) => m.PublicBookingStudio,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="booking-aurora relative min-h-[70vh] overflow-hidden rounded-3xl">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="relative z-10 flex min-h-[70vh] items-center justify-center text-white/70">
          Opening booking studio…
        </div>
      </div>
    ),
  },
);

export function BookStudioClient() {
  return <PublicBookingStudio />;
}
