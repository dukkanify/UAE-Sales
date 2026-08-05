"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { CalendarClock, Check, Clock, Plane } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingFetch, bookingJson } from "@/features/bookings/lib/api";
import { cn } from "@/lib/utils";
import type {
  AppointmentBooking,
  BookingListItem,
  BookingSettings,
  BookingSlot,
} from "@/types/bookings";
import type { UserProfile } from "@/types";

function StudentBookingView() {
  const [settings, setSettings] = React.useState<BookingSettings | null>(null);
  const [instructors, setInstructors] = React.useState<UserProfile[]>([]);
  const [myBookings, setMyBookings] = React.useState<BookingListItem[]>([]);
  const [sessionTypeId, setSessionTypeId] = React.useState("");
  const [instructorId, setInstructorId] = React.useState("");
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = React.useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const loadBase = React.useCallback(async () => {
    const [settingsRes, metaRes, mineRes] = await Promise.all([
      bookingFetch<BookingSettings>("/api/bookings/settings"),
      bookingFetch<{ instructors: UserProfile[] }>("/api/bookings/slots?meta=1"),
      bookingFetch<BookingListItem[]>("/api/bookings"),
    ]);
    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
      const active = settingsRes.data.sessionTypes.filter((t) => t.active);
      const firstType = active[0];
      if (firstType) setSessionTypeId((prev) => prev || firstType.id);
    }
    if (metaRes.success && metaRes.data) {
      setInstructors(metaRes.data.instructors);
      const firstInstructor = metaRes.data.instructors[0];
      if (firstInstructor) {
        setInstructorId((prev) => prev || firstInstructor.id);
      }
    }
    if (mineRes.success && mineRes.data) setMyBookings(mineRes.data);
  }, []);

  React.useEffect(() => {
    void loadBase();
  }, [loadBase]);

  React.useEffect(() => {
    if (!date || !instructorId || !sessionTypeId) return;
    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await bookingFetch<BookingSlot[]>(
        `/api/bookings/slots?date=${encodeURIComponent(date)}&instructorId=${encodeURIComponent(instructorId)}&sessionTypeId=${encodeURIComponent(sessionTypeId)}`,
      );
      if (cancelled) return;
      setSlots(res.data ?? []);
      setLoadingSlots(false);
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [date, instructorId, sessionTypeId]);

  async function handleBook() {
    if (!selectedSlot) return;
    setSubmitting(true);
    const res = await bookingJson<AppointmentBooking>("/api/bookings", "POST", {
      instructorId,
      sessionTypeId,
      startsAt: selectedSlot,
      notes,
    });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error ?? "Could not book");
      return;
    }
    toast.success(
      res.data?.status === "pending"
        ? "Booking submitted — awaiting admin confirmation"
        : "Session booked successfully",
    );
    setNotes("");
    setSelectedSlot(null);
    await loadBase();
    // refresh slots
    const slotsRes = await bookingFetch<BookingSlot[]>(
      `/api/bookings/slots?date=${encodeURIComponent(date)}&instructorId=${encodeURIComponent(instructorId)}&sessionTypeId=${encodeURIComponent(sessionTypeId)}`,
    );
    setSlots(slotsRes.data ?? []);
  }

  async function cancelBooking(id: string) {
    const res = await bookingJson("/api/bookings/" + id, "PATCH", {
      status: "cancelled",
      cancelReason: "Cancelled by student",
    });
    if (!res.success) {
      toast.error(res.error ?? "Could not cancel");
      return;
    }
    toast.success("Booking cancelled");
    await loadBase();
  }

  const activeTypes = settings?.sessionTypes.filter((t) => t.active) ?? [];
  const upcoming = myBookings.filter((b) => b.status === "pending" || b.status === "confirmed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a session"
        description="Book 1:1 instructor time around the clock — pick a slot and confirm."
        breadcrumbs={[{ label: "Student" }, { label: "Bookings" }]}
      />

      {!settings?.enabled ? (
        <div className="rounded-2xl border border-border/60 bg-card px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold">Booking is closed</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            An administrator has temporarily paused self-booking.
          </p>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1A24] px-5 py-6 text-white sm:px-7">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(46,125,170,0.45), transparent 55%), radial-gradient(ellipse 45% 55% at 0% 100%, rgba(221,155,48,0.2), transparent 50%)",
              }}
            />
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                  {settings.aroundTheClock ? "24/7 availability" : "Scheduled hours"}
                </p>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Choose your flight path
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/65">
                  Select a session type, instructor, and time — booking is open around the clock.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Up to {settings.maxAdvanceDays} days ahead
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Session type</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={sessionTypeId}
                    onChange={(e) => setSessionTypeId(e.target.value)}
                  >
                    {activeTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                  >
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.fullName || i.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm sm:max-w-xs"
                  value={date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Available times
                </p>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading slots…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No slots this day.</p>
                ) : (
                  <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
                    {slots.map((slot) => {
                      const label = format(parseISO(slot.startsAt), "HH:mm");
                      const selected = selectedSlot === slot.startsAt;
                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.startsAt)}
                          className={cn(
                            "rounded-xl px-2 py-2.5 text-sm font-medium transition-all",
                            !slot.available &&
                              "cursor-not-allowed bg-muted/40 text-muted-foreground/50 line-through",
                            slot.available &&
                              !selected &&
                              "bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary",
                            selected && "bg-accent text-accent-foreground shadow-soft",
                          )}
                          title={slot.reason}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to cover?"
                  rows={3}
                />
              </div>

              <Button
                variant="accent"
                size="lg"
                disabled={!selectedSlot || submitting}
                onClick={() => void handleBook()}
              >
                {submitting ? "Booking…" : "Confirm booking"}
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Your bookings
              </p>
              {upcoming.length === 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card px-5 py-10 text-center">
                  <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Plane className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <p className="font-medium">No upcoming bookings</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pick a slot to schedule your next session.
                  </p>
                </div>
              ) : (
                upcoming.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{b.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(b.startsAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={b.status === "confirmed" ? "default" : "outline"}>
                        {b.status === "confirmed" ? (
                          <span className="inline-flex items-center gap-1">
                            <Check className="h-3 w-3" /> confirmed
                          </span>
                        ) : (
                          b.status
                        )}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 text-destructive"
                      onClick={() => void cancelBooking(b.id)}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { StudentBookingView };
