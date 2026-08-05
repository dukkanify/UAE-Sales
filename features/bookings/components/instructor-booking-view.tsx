"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookingFetch, bookingJson } from "@/features/bookings/lib/api";
import type { BookingListItem } from "@/types/bookings";

function InstructorBookingView() {
  const [bookings, setBookings] = React.useState<BookingListItem[]>([]);

  const load = React.useCallback(async () => {
    const res = await bookingFetch<BookingListItem[]>("/api/bookings");
    if (res.success && res.data) setBookings(res.data);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function cancel(id: string) {
    const res = await bookingJson("/api/bookings/" + id, "PATCH", {
      status: "cancelled",
      cancelReason: "Cancelled by instructor",
    });
    if (!res.success) {
      toast.error(res.error ?? "Could not cancel");
      return;
    }
    toast.success("Booking cancelled");
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        description="Sessions students booked with you."
        breadcrumbs={[{ label: "Instructor" }, { label: "Bookings" }]}
      />
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold">No bookings yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            When students book your time, they appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">
                  {b.studentName} · {new Date(b.startsAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{b.status}</Badge>
                {b.status === "confirmed" ? (
                  <Button size="sm" variant="accent" asChild>
                    <a href={`/bookings/join/${b.id}`}>Join Zoom</a>
                  </Button>
                ) : null}
                {b.status === "pending" || b.status === "confirmed" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => void cancel(b.id)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { InstructorBookingView };
