"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  Clock,
  Radio,
  Shield,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

type Step = "session" | "when" | "confirm" | "success";

function StudentBookingView() {
  const [settings, setSettings] = React.useState<BookingSettings | null>(null);
  const [instructors, setInstructors] = React.useState<UserProfile[]>([]);
  const [myBookings, setMyBookings] = React.useState<BookingListItem[]>([]);
  const [step, setStep] = React.useState<Step>("session");
  const [sessionTypeId, setSessionTypeId] = React.useState("");
  const [instructorId, setInstructorId] = React.useState("");
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = React.useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [created, setCreated] = React.useState<AppointmentBooking | null>(null);

  const loadBase = React.useCallback(async () => {
    const [settingsRes, metaRes, mineRes] = await Promise.all([
      bookingFetch<BookingSettings>("/api/bookings/settings"),
      bookingFetch<{ instructors: UserProfile[] }>("/api/bookings/slots?meta=1"),
      bookingFetch<BookingListItem[]>("/api/bookings"),
    ]);
    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
      const firstType = settingsRes.data.sessionTypes.find((t) => t.active);
      if (firstType) setSessionTypeId((prev) => prev || firstType.id);
    }
    if (metaRes.success && metaRes.data) {
      setInstructors(metaRes.data.instructors);
      const firstInstructor = metaRes.data.instructors[0];
      if (firstInstructor) setInstructorId((prev) => prev || firstInstructor.id);
    }
    if (mineRes.success && mineRes.data) setMyBookings(mineRes.data);
  }, []);

  React.useEffect(() => {
    void loadBase();
  }, [loadBase]);

  React.useEffect(() => {
    if (!date || !instructorId || !sessionTypeId || step === "session") return;
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
  }, [date, instructorId, sessionTypeId, step]);

  const activeTypes = settings?.sessionTypes.filter((t) => t.active) ?? [];
  const selectedType = activeTypes.find((t) => t.id === sessionTypeId);
  const selectedInstructor = instructors.find((i) => i.id === instructorId);
  const upcoming = myBookings.filter((b) => b.status === "pending" || b.status === "confirmed");

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
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Could not book");
      return;
    }
    setCreated(res.data);
    setStep("success");
    setNotes("");
    await loadBase();
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

  if (!settings) {
    return (
      <div className="booking-aurora relative min-h-[70vh] overflow-hidden rounded-3xl">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="relative z-10 flex min-h-[70vh] items-center justify-center text-white/70">
          Preparing Zoom booking studio…
        </div>
      </div>
    );
  }

  if (!settings.enabled) {
    return (
      <div className="booking-aurora relative overflow-hidden rounded-3xl px-6 py-20 text-center text-white">
        <div className="booking-grid-fade absolute inset-0" />
        <Video className="relative z-10 mx-auto mb-4 h-10 w-10 text-accent" />
        <h1 className="relative z-10 font-display text-3xl font-semibold">Booking studio closed</h1>
        <p className="relative z-10 mx-auto mt-3 max-w-md text-white/65">
          An administrator paused self-booking. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="booking-aurora relative overflow-hidden rounded-3xl px-5 py-8 text-white sm:px-8 sm:py-10">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="booking-scan-line" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              <Radio className="h-3.5 w-3.5" /> Zoom appointment studio
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Book your{" "}
              <span className="bg-gradient-to-r from-[#5BA3C9] to-accent bg-clip-text text-transparent">
                live session
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Reserve a private Zoom flight with your instructor —{" "}
              {settings.aroundTheClock ? "open 24/7" : "within scheduled hours"}, with instant
              meeting credentials when confirmed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              settings.aroundTheClock ? "24/7 slots" : "Timed slots",
              settings.autoCreateZoom ? "Auto Zoom room" : "Manual Zoom",
              settings.zoomWaitingRoom ? "Waiting room" : "Direct entry",
            ].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/75 ring-1 ring-white/10"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8 flex gap-2">
          {(
            [
              { id: "session", label: "01 Session" },
              { id: "when", label: "02 Schedule" },
              { id: "confirm", label: "03 Confirm" },
              { id: "success", label: "04 Zoom ready" },
            ] as const
          ).map((s, i) => {
            const order = ["session", "when", "confirm", "success"] as Step[];
            const activeIdx = order.indexOf(step);
            const done = i < activeIdx || step === "success";
            const current = s.id === step;
            return (
              <div key={s.id} className="flex flex-1 flex-col gap-2">
                <div
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    done || current ? "bg-accent" : "bg-white/15",
                  )}
                />
                <span
                  className={cn(
                    "hidden text-[10px] font-semibold uppercase tracking-[0.16em] sm:block",
                    current ? "text-accent" : "text-white/40",
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-medium">
          <AnimatePresence mode="wait">
            {step === "session" ? (
              <motion.div
                key="session"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="p-5 sm:p-8"
              >
                <h2 className="font-display text-2xl font-semibold">Choose your mission</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Session type and instructor for your Zoom room.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {activeTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSessionTypeId(t.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        sessionTypeId === t.id
                          ? "border-accent bg-accent/10 shadow-soft"
                          : "border-border/60 hover:border-primary/40 hover:bg-muted/40",
                      )}
                    >
                      <Sparkles
                        className={cn(
                          "mb-3 h-5 w-5",
                          sessionTypeId === t.id ? "text-accent" : "text-primary",
                        )}
                      />
                      <p className="font-display font-semibold">{t.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {t.durationMinutes} min · Zoom
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <Label>Instructor</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {instructors.map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setInstructorId(i.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                          instructorId === i.id
                            ? "border-primary bg-primary/10"
                            : "border-border/60 hover:bg-muted/40",
                        )}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1A24] font-display text-sm font-semibold text-accent">
                          {(i.firstName?.[0] ?? i.email[0] ?? "?").toUpperCase()}
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{i.fullName || i.email}</span>
                          <span className="text-xs text-muted-foreground">Zoom host</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    variant="accent"
                    size="lg"
                    disabled={!sessionTypeId || !instructorId}
                    onClick={() => setStep("when")}
                  >
                    Continue to schedule
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {step === "when" ? (
              <motion.div
                key="when"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="p-5 sm:p-8"
              >
                <button
                  type="button"
                  className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setStep("session")}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h2 className="font-display text-2xl font-semibold">Pick date & time</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {settings.aroundTheClock
                    ? "Around-the-clock availability — every slot is a private Zoom room."
                    : "Select within the open booking window."}
                </p>

                <div className="mt-6 space-y-2">
                  <Label>Date</Label>
                  <input
                    type="date"
                    className="flex h-11 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm"
                    value={date}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="mt-6">
                  <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Available Zoom slots
                  </p>
                  {loadingSlots ? (
                    <p className="text-sm text-muted-foreground">Loading airspace…</p>
                  ) : (
                    <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
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
                              "rounded-xl px-2 py-3 text-sm font-semibold transition-all",
                              !slot.available &&
                                "cursor-not-allowed bg-muted/30 text-muted-foreground/40 line-through",
                              slot.available &&
                                !selected &&
                                "bg-muted/50 hover:bg-primary/15 hover:text-primary",
                              selected &&
                                "bg-[#0B1A24] text-accent shadow-medium ring-2 ring-accent/40",
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

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep("session")}>
                    Back
                  </Button>
                  <Button
                    variant="accent"
                    size="lg"
                    disabled={!selectedSlot}
                    onClick={() => setStep("confirm")}
                  >
                    Review & Zoom
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {step === "confirm" ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="p-5 sm:p-8"
              >
                <button
                  type="button"
                  className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setStep("when")}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h2 className="font-display text-2xl font-semibold">Confirm Zoom booking</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A secure Zoom room will be prepared for this appointment.
                </p>

                <div className="mt-6 space-y-3 rounded-2xl bg-[#0B1A24] p-5 text-white">
                  <Row label="Session" value={selectedType?.name ?? "—"} />
                  <Row
                    label="Instructor"
                    value={selectedInstructor?.fullName || selectedInstructor?.email || "—"}
                  />
                  <Row
                    label="Starts"
                    value={selectedSlot ? new Date(selectedSlot).toLocaleString() : "—"}
                  />
                  <Row label="Duration" value={`${selectedType?.durationMinutes ?? "—"} minutes`} />
                  <Row
                    label="Zoom"
                    value={
                      settings.requireConfirmation
                        ? "Room after admin confirm"
                        : "Room created on confirm"
                    }
                  />
                </div>

                <div className="mt-5 space-y-2">
                  <Label>Notes for instructor</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Topics, exam focus, questions…"
                    rows={3}
                  />
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep("when")}>
                    Back
                  </Button>
                  <Button
                    variant="accent"
                    size="lg"
                    disabled={submitting}
                    onClick={() => void handleBook()}
                  >
                    {submitting ? "Creating Zoom room…" : "Confirm & reserve Zoom"}
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {step === "success" && created ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 sm:p-8"
              >
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                  <span className="booking-pulse absolute inset-0 rounded-full" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-7 w-7" />
                  </span>
                </div>
                <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
                  {created.status === "pending" ? "Awaiting clearance" : "Zoom room ready"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
                  {created.status === "pending"
                    ? "Admin will confirm shortly — Zoom credentials unlock after approval."
                    : "Your private Zoom appointment is locked in. Enter the lobby when it’s time."}
                </p>

                <div className="mx-auto mt-8 max-w-lg space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <p className="font-medium">{created.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(created.startsAt).toLocaleString()}
                  </p>
                  {created.zoom ? (
                    <div className="space-y-2 border-t border-border/50 pt-3 text-sm">
                      <p className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        Meeting ID: <span className="font-mono">{created.zoom.meetingNumber}</span>
                      </p>
                      {created.zoom.password ? (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          Passcode: <span className="font-mono">{created.zoom.password}</span>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {created.status === "confirmed" ? (
                    <Button variant="accent" size="lg" asChild>
                      <Link href={`/bookings/join/${created.id}`}>
                        Open Zoom lobby
                        <Video className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreated(null);
                      setSelectedSlot(null);
                      setStep("session");
                    }}
                  >
                    Book another
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Your Zoom bookings
            </p>
            <div className="mt-4 space-y-3">
              {upcoming.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming Zoom appointments.
                </p>
              ) : (
                upcoming.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{b.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(b.startsAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={b.status === "confirmed" ? "default" : "outline"}>
                        {b.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {b.status === "confirmed" ? (
                        <Button size="sm" variant="accent" asChild>
                          <Link href={`/bookings/join/${b.id}`}>Join Zoom</Link>
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => void cancelBooking(b.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 text-sm last:border-0 last:pb-0">
      <span className="text-white/50">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export { StudentBookingView };
