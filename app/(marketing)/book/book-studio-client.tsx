"use client";

import dynamic from "next/dynamic";

const PublicBookingStudio = dynamic(
  () =>
    import("@/features/bookings/components/public-booking-studio").then((m) => ({
      default: m.PublicBookingStudio,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="container-app py-24 text-center text-sm text-muted-foreground">
        Loading booking studio…
      </div>
    ),
  },
);

/** Client boundary for /book — code-splits the heavy studio off the initial marketing bundle. */
export function BookStudioClient() {
  return <PublicBookingStudio />;
}
