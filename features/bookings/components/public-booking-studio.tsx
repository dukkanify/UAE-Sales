"use client";

import * as React from "react";
import { addDays, format, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, Check, Clock3, Shield, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureBrowserCsrf, getCsrfToken } from "@/lib/security/browser-csrf";
import {
  formatSlotDateTime,
  formatSlotTime,
  maxBookableDate,
  type ResolvedBookableDay,
} from "@/features/bookings/lib/slot-utils";
import { cn } from "@/lib/utils";
import type { BookingSlot, PublicBookingCatalog } from "@/types/bookings";

type Step = "when" | "details" | "otp" | "done";

const STEPS: Array<{ id: Step; label: string; short: string }> = [
  { id: "when", label: "When", short: "Time" },
  { id: "details", label: "Details", short: "You" },
  { id: "otp", label: "Confirm", short: "Code" },
  { id: "done", label: "Ready", short: "Zoom" },
];

async function publicFetch<T>(url: string, init?: RequestInit) {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  if (method !== "GET" && method !== "HEAD") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const csrf = getCsrfToken() ?? (await ensureBrowserCsrf());
    if (csrf) headers.set("x-csrf-token", csrf);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: T | null;
    error?: string | null;
  } | null;
  if (!json) {
    return { success: false, data: null as T | null, error: "Unexpected server response" };
  }
  return {
    success: Boolean(json.success),
    data: (json.data as T | null) ?? null,
    error: json.error ?? null,
  };
}

function periodForHour(hour: number): "Morning" | "Afternoon" | "Evening" {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function groupOpenSlots(slots: BookingSlot[]) {
  const groups: Array<{ label: "Morning" | "Afternoon" | "Evening"; slots: BookingSlot[] }> = [
    { label: "Morning", slots: [] },
    { label: "Afternoon", slots: [] },
    { label: "Evening", slots: [] },
  ];
  for (const slot of slots.filter((s) => s.available)) {
    const hour = new Date(slot.startsAt).getHours();
    const label = periodForHour(hour);
    groups.find((g) => g.label === label)?.slots.push(slot);
  }
  return groups.filter((g) => g.slots.length > 0);
}

function stepIndex(step: Step) {
  return STEPS.findIndex((s) => s.id === step);
}

function PublicBookingStudio() {
  const router = useRouter();
  const [catalog, setCatalog] = React.useState<PublicBookingCatalog | null>(null);
  const [step, setStep] = React.useState<Step>("when");
  const [sessionTypeId, setSessionTypeId] = React.useState("");
  const [instructorId, setInstructorId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [slots, setSlots] = React.useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [demoOtp, setDemoOtp] = React.useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState<string | null>(null);
  const [slotHint, setSlotHint] = React.useState<string | null>(null);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const pendingAdvanceHintRef = React.useRef(false);

  const loadCatalog = React.useCallback(async () => {
    setCatalogError(null);
    const res = await publicFetch<PublicBookingCatalog>("/api/public/bookings");
    if (res.success && res.data) {
      setCatalog(res.data);
      const types = res.data.sessionTypes ?? [];
      const instructors = res.data.instructors ?? [];
      setSessionTypeId((prev) => prev || types[0]?.id || "");
      setInstructorId((prev) => prev || instructors[0]?.id || "");
      setDate((prev) => prev || format(new Date(), "yyyy-MM-dd"));
      setStep("when");
      return;
    }
    setCatalogError(res.error ?? "Could not open booking studio");
  }, []);

  React.useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  React.useEffect(() => {
    if (step !== "when" || !date || !instructorId || !sessionTypeId) return;
    let cancelled = false;
    async function load() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const res = await publicFetch<ResolvedBookableDay>(
        `/api/public/bookings?date=${encodeURIComponent(date)}&instructorId=${encodeURIComponent(instructorId)}&sessionTypeId=${encodeURIComponent(sessionTypeId)}&findNext=1`,
      );
      if (cancelled) return;
      if (!res.success || !res.data) {
        setSlots([]);
        setSlotHint(res.error ?? "Could not load open slots.");
        setLoadingSlots(false);
        return;
      }
      const resolved = res.data;
      setSlots(resolved.slots ?? []);
      if (resolved.autoAdvanced && resolved.date !== date) {
        pendingAdvanceHintRef.current = true;
        setDate(resolved.date);
        setSlotHint("Moved to the next day with open Zoom times.");
      } else if (pendingAdvanceHintRef.current) {
        pendingAdvanceHintRef.current = false;
        setSlotHint("Moved to the next day with open Zoom times.");
      } else if (!(resolved.slots ?? []).some((s) => s.available)) {
        setSlotHint("No open slots in the booking window. Try another instructor.");
      } else {
        setSlotHint(null);
      }
      setLoadingSlots(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [date, instructorId, sessionTypeId, step]);

  const selectedType = catalog?.sessionTypes?.find((t) => t.id === sessionTypeId);
  const selectedInstructor = catalog?.instructors?.find((i) => i.id === instructorId);
  const groupedSlots = React.useMemo(() => groupOpenSlots(slots), [slots]);
  const openCount = groupedSlots.reduce((n, g) => n + g.slots.length, 0);
  const activeStep = stepIndex(step);
  const dateChips = React.useMemo(() => {
    const start = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const d = addDays(start, i);
      return {
        value: format(d, "yyyy-MM-dd"),
        day: format(d, "EEE"),
        label: format(d, "d MMM"),
      };
    });
  }, []);

  async function holdAndSendOtp() {
    if (!selectedSlot) return;
    setSubmitting(true);
    const res = await publicFetch<{
      bookingId: string;
      email: string;
      demoOtp?: string;
    }>("/api/public/bookings/hold", {
      method: "POST",
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        instructorId,
        sessionTypeId,
        startsAt: selectedSlot,
        notes,
      }),
    });
    setSubmitting(false);
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Could not reserve slot");
      return;
    }
    setDemoOtp(res.data.demoOtp ?? null);
    setStep("otp");
    toast.success("Code sent — confirm to open Zoom");
  }

  async function verifyAndFinish() {
    setSubmitting(true);
    const res = await publicFetch<{ redirectTo: string }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        email,
        token: otp,
        purpose: "booking",
      }),
    });
    setSubmitting(false);
    if (!res.success || !res.data?.redirectTo) {
      toast.error(res.error ?? "Invalid code");
      return;
    }
    setRedirectTo(res.data.redirectTo);
    setStep("done");
    toast.success("Booking confirmed — opening Zoom lobby");
    window.setTimeout(() => router.push(res.data!.redirectTo), 700);
  }

  if (!catalog) {
    return (
      <div className="booking-hero relative min-h-[70vh]">
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center text-white/75">
          <p className="landing-kicker text-accent">AviatorPass</p>
          <p>{catalogError ?? "Opening live booking…"}</p>
          {catalogError ? (
            <Button
              variant="accent"
              className="hero-cta-primary"
              onClick={() => void loadCatalog()}
            >
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!catalog.enabled || !catalog.allowGuestBooking) {
    return (
      <div className="booking-hero relative px-6 py-24 text-center text-white">
        <Video className="relative z-10 mx-auto mb-4 h-10 w-10 text-accent" />
        <h1 className="relative z-10 font-display text-3xl font-semibold text-white">
          Booking unavailable
        </h1>
        <p className="relative z-10 mx-auto mt-3 max-w-md text-white/65">
          Public booking is paused. Enter the platform if you already have an account.
        </p>
      </div>
    );
  }

  return (
    <div className="platform-altitude landing-root">
      <section className="booking-hero text-white">
        <div className="container-app relative z-10 py-14 sm:py-20">
          <p className="landing-kicker text-accent">AviatorPass live</p>
          <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-semibold tracking-[-0.04em] leading-[1.02] text-white">
            AviatorPass
          </h1>
          <p className="mt-4 max-w-[22ch] font-display text-[clamp(1.25rem,2.6vw,1.85rem)] font-semibold tracking-[-0.03em] leading-snug text-white/92">
            Book live Zoom coaching in three smart steps
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Pick a lane, confirm by email, join Zoom — your learner account opens when you confirm.
            No signup form first.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            <span className="inline-flex items-center gap-1.5 text-accent/90">
              <Sparkles className="h-3.5 w-3.5" />
              Instant hold
            </span>
            <span>Email OTP</span>
            <span>Zoom lobby</span>
          </div>
        </div>
      </section>

      <section className="container-app py-10 sm:py-14">
        <ol className="mb-8 grid grid-cols-4 gap-2 sm:gap-3" aria-label="Booking progress">
          {STEPS.map((item, index) => {
            const done = index < activeStep || step === "done";
            const current = item.id === step;
            return (
              <li
                key={item.id}
                className={cn(
                  "rounded-2xl border px-3 py-3 transition sm:px-4",
                  current
                    ? "border-[rgb(18_36_51_/0.16)] bg-[var(--surface-ink)] text-white shadow-[0_16px_40px_-28px_rgba(11,26,36,0.85)]"
                    : done
                      ? "border-accent/30 bg-accent/10 text-foreground"
                      : "border-[rgb(18_36_51_/0.08)] bg-white/55 text-muted-foreground",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.2em]",
                    current ? "text-accent" : "text-inherit opacity-70",
                  )}
                >
                  0{index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight">
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </p>
              </li>
            );
          })}
        </ol>

        <div className="overflow-hidden rounded-[1.75rem] border border-[rgb(18_36_51_/0.08)] bg-white/80 shadow-[0_30px_80px_-48px_rgba(11,26,36,0.55)] backdrop-blur-sm">
          {step === "when" ? (
            <div className="booking-step-panel p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                    Choose your Zoom window
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Select session, instructor, and an open time. We only show bookable slots.
                  </p>
                </div>
                <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {loadingSlots
                    ? "Scanning…"
                    : `${openCount} open slot${openCount === 1 ? "" : "s"}`}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <Label>Session</Label>
                <div className="flex flex-wrap gap-2">
                  {(catalog.sessionTypes ?? []).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      data-selected={sessionTypeId === t.id}
                      className="booking-chip rounded-xl px-4 py-2.5 text-sm font-semibold"
                      onClick={() => setSessionTypeId(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  <Label htmlFor="instructor">Instructor</Label>
                  <select
                    id="instructor"
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                  >
                    {(catalog.instructors ?? []).map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="book-date">Date</Label>
                  <div className="flex flex-wrap gap-2">
                    {dateChips.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        data-selected={date === chip.value}
                        className="booking-chip min-w-[4.5rem] rounded-xl px-3 py-2 text-left"
                        onClick={() => setDate(chip.value)}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                          {chip.day}
                        </span>
                        <span className="text-sm font-semibold">{chip.label}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    id="book-date"
                    type="date"
                    className="flex h-11 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm"
                    value={date}
                    min={format(new Date(), "yyyy-MM-dd")}
                    max={maxBookableDate(catalog.maxAdvanceDays ?? 30)}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-primary/70" />
                    Open times
                    {date ? (
                      <span className="normal-case tracking-normal text-foreground/70">
                        · {format(parseISO(date), "EEE d MMM")}
                      </span>
                    ) : null}
                  </p>
                </div>

                {slotHint ? (
                  <p className="mb-4 rounded-xl border border-accent/25 bg-accent/10 px-3.5 py-2.5 text-sm text-foreground/85">
                    {slotHint}
                  </p>
                ) : null}

                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading open times…</p>
                ) : openCount > 0 ? (
                  <div className="space-y-6">
                    {groupedSlots.map((group) => (
                      <div key={group.label}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                          {group.label}
                          <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground">
                            {group.slots.length}
                          </span>
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                          {group.slots.map((slot) => {
                            const selected = selectedSlot === slot.startsAt;
                            return (
                              <button
                                key={slot.startsAt}
                                type="button"
                                data-selected={selected}
                                className="booking-slot rounded-xl px-2 py-3 text-sm font-semibold"
                                onClick={() => setSelectedSlot(slot.startsAt)}
                              >
                                {formatSlotTime(slot.startsAt)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                    No open times on this date. Choose another day above.
                  </p>
                )}
              </div>

              <div className="mt-10 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[rgb(18_36_51_/0.08)] pt-6 sm:flex-row sm:items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedSlot
                    ? `Selected · ${formatSlotDateTime(selectedSlot)}`
                    : "Select a time to continue"}
                </p>
                <Button
                  variant="accent"
                  size="lg"
                  className="hero-cta-primary"
                  disabled={!selectedSlot}
                  onClick={() => setStep("details")}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "details" ? (
            <div className="booking-step-panel p-5 sm:p-8 lg:p-10">
              <button
                type="button"
                className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                onClick={() => setStep("when")}
              >
                <ArrowLeft className="h-4 w-4" /> Back to times
              </button>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Your details
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Confirm by email — we create learner access and prepare your Zoom lobby.
              </p>

              <div className="mt-6 rounded-2xl bg-[var(--surface-ink)] p-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Hold summary
                </p>
                <p className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {selectedType?.name}
                </p>
                <p className="mt-1 text-sm text-white/65">
                  {selectedInstructor?.fullName}
                  {selectedSlot ? ` · ${formatSlotDateTime(selectedSlot)}` : ""}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <input
                    id="first-name"
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <input
                    id="last-name"
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Topics to cover, exam date, weak areas…"
                />
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  className="hero-cta-primary"
                  disabled={
                    submitting || !firstName.trim() || !lastName.trim() || !email.includes("@")
                  }
                  onClick={() => void holdAndSendOtp()}
                >
                  {submitting ? "Reserving…" : "Reserve & send code"}
                </Button>
              </div>
            </div>
          ) : null}

          {step === "otp" ? (
            <div className="booking-step-panel p-5 sm:p-8 lg:p-10">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Enter code → Zoom
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Code sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              {demoOtp ? (
                <p className="mt-4 rounded-xl border border-accent/25 bg-accent/12 px-3.5 py-2.5 text-sm">
                  Demo OTP: <span className="font-mono font-semibold">{demoOtp}</span>
                </p>
              ) : null}
              <div className="mt-6 space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <input
                  id="otp"
                  className="flex h-14 w-full max-w-sm rounded-xl border border-input bg-background px-3 text-center font-mono text-xl tracking-[0.4em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  maxLength={8}
                  placeholder="••••••"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary/70" />
                Confirming creates your student account and unlocks Zoom.
              </p>
              <div className="mt-8 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  className="hero-cta-primary"
                  disabled={submitting || otp.length < 4}
                  onClick={() => void verifyAndFinish()}
                >
                  {submitting ? "Confirming…" : "Confirm booking"}
                </Button>
              </div>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="booking-step-panel p-8 text-center sm:p-14">
              <span className="booking-pulse relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-7 w-7" />
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">
                You&apos;re booked
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Account created and Zoom room prepared. Opening your lobby…
              </p>
              {redirectTo ? (
                <Button
                  className="hero-cta-primary mt-8"
                  variant="accent"
                  onClick={() => router.push(redirectTo)}
                >
                  Open Zoom lobby
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export { PublicBookingStudio };
