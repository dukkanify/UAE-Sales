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
  collectDeviceFingerprint,
  describeDeviceFromUserAgent,
} from "@/lib/security/device-fingerprint";
import {
  formatSlotDateTime,
  formatSlotTime,
  maxBookableDate,
  type ResolvedBookableDay,
} from "@/features/bookings/lib/slot-utils";
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
    const deviceFingerprint = await collectDeviceFingerprint();
    const deviceLabel =
      typeof navigator !== "undefined" ? describeDeviceFromUserAgent(navigator.userAgent) : null;
    const res = await publicFetch<{ redirectTo: string }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({
        email,
        token: otp,
        purpose: "booking",
        deviceFingerprint,
        deviceLabel,
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
        <div className="container-app relative z-10 py-10 sm:py-14">
          <p className="landing-kicker text-accent">AviatorPass live</p>
          <h1 className="mt-3 max-w-[12ch] font-display text-[clamp(2.1rem,4.8vw,3.4rem)] font-semibold tracking-[-0.04em] leading-[1.02] text-white">
            AviatorPass
          </h1>
          <p className="mt-3 max-w-[26ch] font-display text-[clamp(1.15rem,2.2vw,1.55rem)] font-semibold tracking-[-0.03em] leading-snug text-white/92">
            Book live Zoom coaching
          </p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65 sm:text-[0.95rem]">
            Pick a time, confirm by email, join Zoom — your learner account opens when you confirm.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <span className="inline-flex items-center gap-1.5 text-accent/90">
              <Sparkles className="h-3.5 w-3.5" />
              Instant hold
            </span>
            <span>Email OTP</span>
            <span>Zoom lobby</span>
          </div>
        </div>
      </section>

      <section className="container-app booking-studio">
        <ol className="booking-progress" aria-label="Booking progress">
          {STEPS.map((item, index) => {
            const done = index < activeStep || step === "done";
            const current = item.id === step;
            return (
              <li
                key={item.id}
                data-current={current}
                data-done={done}
                className="booking-progress-item"
              >
                <span className="booking-progress-index">0{index + 1}</span>
                <span className="booking-progress-label">
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="booking-shell">
          {step === "when" ? (
            <div className="booking-step-panel">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h2 className="booking-step-heading">Choose your Zoom window</h2>
                  <p className="booking-step-lead">
                    Session, instructor, and an open time — only bookable slots appear.
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                  {loadingSlots
                    ? "Scanning…"
                    : `${openCount} open slot${openCount === 1 ? "" : "s"}`}
                </p>
              </div>

              <div className="mt-5">
                <span className="booking-field-label">Session</span>
                <div className="booking-option-grid" role="listbox" aria-label="Session type">
                  {(catalog.sessionTypes ?? []).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={sessionTypeId === t.id}
                      data-selected={sessionTypeId === t.id}
                      className="booking-option"
                      onClick={() => setSessionTypeId(t.id)}
                    >
                      <span className="booking-option-title">{t.name}</span>
                      {t.durationMinutes ? (
                        <span className="booking-option-meta">{t.durationMinutes} min</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <Label htmlFor="instructor" className="booking-field-label">
                    Instructor
                  </Label>
                  <select
                    id="instructor"
                    className="flex h-11 w-full border border-input bg-background px-3 text-sm"
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
                <div>
                  <span className="booking-field-label">Date</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dateChips.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        data-selected={date === chip.value}
                        className="booking-chip min-w-[4.25rem] px-2.5 py-1.5 text-left"
                        onClick={() => setDate(chip.value)}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
                          {chip.day}
                        </span>
                        <span className="text-sm font-semibold leading-tight">{chip.label}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    id="book-date"
                    type="date"
                    className="mt-2 flex h-10 w-full max-w-[14rem] border border-input bg-background px-3 text-sm"
                    value={date}
                    min={format(new Date(), "yyyy-MM-dd")}
                    max={maxBookableDate(catalog.maxAdvanceDays ?? 30)}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2.5 inline-flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-primary/70" />
                  Open times
                  {date ? (
                    <span className="normal-case tracking-normal text-foreground/70">
                      · {format(parseISO(date), "EEE d MMM")}
                    </span>
                  ) : null}
                </p>

                {slotHint ? (
                  <p className="mb-3 border border-accent/25 bg-accent/10 px-3 py-2 text-sm leading-snug text-foreground/85">
                    {slotHint}
                  </p>
                ) : null}

                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading open times…</p>
                ) : openCount > 0 ? (
                  <div className="space-y-4">
                    {groupedSlots.map((group) => (
                      <div key={group.label}>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                          {group.label}
                          <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground">
                            {group.slots.length}
                          </span>
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                          {group.slots.map((slot) => {
                            const selected = selectedSlot === slot.startsAt;
                            return (
                              <button
                                key={slot.startsAt}
                                type="button"
                                data-selected={selected}
                                className="booking-slot px-1.5 py-2.5 text-sm font-semibold"
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
                  <p className="border border-dashed border-border/70 px-3 py-8 text-center text-sm text-muted-foreground">
                    No open times on this date. Choose another day above.
                  </p>
                )}
              </div>

              <div className="booking-footer-bar">
                <p className="booking-footer-summary">
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
            <div className="booking-step-panel">
              <button
                type="button"
                className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                onClick={() => setStep("when")}
              >
                <ArrowLeft className="h-4 w-4" /> Back to times
              </button>
              <h2 className="booking-step-heading">Your details</h2>
              <p className="booking-step-lead">
                Confirm by email — we create learner access and prepare your Zoom lobby.
              </p>

              <div className="mt-4 bg-[var(--surface-ink)] px-4 py-3.5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Hold summary
                </p>
                <p className="mt-1.5 font-display text-lg font-semibold tracking-tight leading-snug">
                  {selectedType?.name}
                </p>
                <p className="mt-1 text-sm leading-snug text-white/65">
                  {selectedInstructor?.fullName}
                  {selectedSlot ? ` · ${formatSlotDateTime(selectedSlot)}` : ""}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name">First name</Label>
                  <input
                    id="first-name"
                    className="flex h-11 w-full border border-input bg-background px-3 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name">Last name</Label>
                  <input
                    id="last-name"
                    className="flex h-11 w-full border border-input bg-background px-3 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  className="flex h-11 w-full border border-input bg-background px-3 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Topics to cover, exam date, weak areas…"
                />
              </div>
              <div className="mt-5 flex justify-end">
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
            <div className="booking-step-panel">
              <h2 className="booking-step-heading">Enter code → Zoom</h2>
              <p className="booking-step-lead">
                Code sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              {demoOtp ? (
                <p className="mt-3 border border-accent/25 bg-accent/12 px-3 py-2 text-sm">
                  Demo OTP: <span className="font-mono font-semibold">{demoOtp}</span>
                </p>
              ) : null}
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="otp">Verification code</Label>
                <input
                  id="otp"
                  className="flex h-12 w-full max-w-sm border border-input bg-background px-3 text-center font-mono text-xl tracking-[0.35em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  maxLength={8}
                  placeholder="••••••"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary/70" />
                Confirming creates your student account and unlocks Zoom.
              </p>
              <div className="mt-5 flex justify-end">
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
            <div className="booking-step-panel py-10 text-center sm:py-12">
              <span className="booking-pulse relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-6 w-6" />
              </span>
              <h2 className="booking-step-heading">You&apos;re booked</h2>
              <p className="booking-step-lead mx-auto">
                Account created and Zoom room prepared. Opening your lobby…
              </p>
              {redirectTo ? (
                <Button
                  className="hero-cta-primary mt-6"
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
