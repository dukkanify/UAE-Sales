"use client";

import * as React from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock, Radio, Shield, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureBrowserCsrf, getCsrfToken } from "@/features/auth/services/auth-api";
import {
  formatSlotDateTime,
  formatSlotTime,
  maxBookableDate,
  type ResolvedBookableDay,
} from "@/features/bookings/lib/slot-utils";
import { cn } from "@/lib/utils";
import type { BookingSlot, PublicBookingCatalog } from "@/types/bookings";

type Step = "session" | "when" | "details" | "otp" | "done";

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

function PublicBookingStudio() {
  const router = useRouter();
  const [catalog, setCatalog] = React.useState<PublicBookingCatalog | null>(null);
  const [step, setStep] = React.useState<Step>("when");
  const [sessionTypeId, setSessionTypeId] = React.useState("");
  const [instructorId, setInstructorId] = React.useState("");
  const [date, setDate] = React.useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = React.useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [demoOtp, setDemoOtp] = React.useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState<string | null>(null);
  const [slotHint, setSlotHint] = React.useState<string | null>(null);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const pendingAdvanceHintRef = React.useRef(false);

  React.useEffect(() => {
    void (async () => {
      const res = await publicFetch<PublicBookingCatalog>("/api/public/bookings");
      if (res.success && res.data) {
        setCatalog(res.data);
        setCatalogError(null);
        const types = res.data.sessionTypes ?? [];
        const instructors = res.data.instructors ?? [];
        if (types[0]) setSessionTypeId(types[0].id);
        if (instructors[0]) setInstructorId(instructors[0].id);
        // Express path: land on schedule immediately
        setStep("when");
      } else {
        setCatalogError(res.error ?? "Could not open booking studio");
      }
    })();
  }, []);

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
      setSlots(resolved.slots);
      if (resolved.autoAdvanced && resolved.date !== date) {
        pendingAdvanceHintRef.current = true;
        setDate(resolved.date);
        setSlotHint("No open times left on the selected day — jumped to the next available date.");
      } else if (pendingAdvanceHintRef.current) {
        pendingAdvanceHintRef.current = false;
        setSlotHint("No open times left on the selected day — jumped to the next available date.");
      } else if (!resolved.slots.some((s) => s.available)) {
        setSlotHint("No open slots in the booking window. Try another instructor or session type.");
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

  const selectedType = catalog?.sessionTypes.find((t) => t.id === sessionTypeId);
  const selectedInstructor = catalog?.instructors.find((i) => i.id === instructorId);

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
    setBookingId(res.data.bookingId);
    setDemoOtp(res.data.demoOtp ?? null);
    setStep("otp");
    toast.success("Verification code sent — confirm to finish booking");
  }

  async function verifyAndFinish() {
    if (!bookingId) return;
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
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Invalid code");
      return;
    }
    setRedirectTo(res.data.redirectTo);
    setStep("done");
    toast.success("Booking confirmed — account ready");
    window.setTimeout(() => router.push(res.data!.redirectTo), 900);
  }

  if (!catalog) {
    return (
      <div className="booking-aurora relative min-h-[70vh] overflow-hidden rounded-3xl">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center text-white/70">
          <p>{catalogError ? catalogError : "Opening booking studio…"}</p>
          {catalogError ? (
            <Button
              variant="accent"
              onClick={() => {
                setCatalogError(null);
                void publicFetch<PublicBookingCatalog>("/api/public/bookings").then((res) => {
                  if (res.success && res.data) {
                    setCatalog(res.data);
                    if (res.data.sessionTypes[0]) setSessionTypeId(res.data.sessionTypes[0].id);
                    if (res.data.instructors[0]) setInstructorId(res.data.instructors[0].id);
                  } else {
                    setCatalogError(res.error ?? "Could not open booking studio");
                  }
                });
              }}
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
      <div className="booking-aurora relative overflow-hidden rounded-3xl px-6 py-20 text-center text-white">
        <Video className="relative z-10 mx-auto mb-4 h-10 w-10 text-accent" />
        <h1 className="relative z-10 font-display text-3xl font-semibold">Booking unavailable</h1>
        <p className="relative z-10 mx-auto mt-3 max-w-md text-white/65">
          Public booking is paused. Sign in if you already have an account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-10">
      <div className="booking-aurora relative overflow-hidden rounded-3xl px-5 py-8 text-white sm:px-8 sm:py-10">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="booking-scan-line" />
        <div className="relative z-10">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
            <Radio className="h-3.5 w-3.5" /> Fast Zoom booking
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Pick a time → confirm email →{" "}
            <span className="bg-gradient-to-r from-[#5BA3C9] to-accent bg-clip-text text-transparent">
              join Zoom
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Three quick steps. No registration form first — your account opens when you confirm.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-medium">
        <AnimatePresence mode="wait">
          {step === "session" ? (
            <motion.div
              key="session"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-5 sm:p-8"
            >
              <h2 className="font-display text-2xl font-semibold">1 · Choose session</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {(catalog.sessionTypes ?? []).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSessionTypeId(t.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      sessionTypeId === t.id
                        ? "border-accent bg-accent/10"
                        : "border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <Sparkles className="mb-3 h-5 w-5 text-primary" />
                    <p className="font-display font-semibold">{t.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 space-y-3">
                <Label>Instructor</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(catalog.instructors ?? []).map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setInstructorId(i.id)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                        instructorId === i.id
                          ? "border-primary bg-primary/10"
                          : "border-border/60 hover:bg-muted/40",
                      )}
                    >
                      {i.fullName}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="accent" size="lg" onClick={() => setStep("when")}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "when" ? (
            <motion.div
              key="when"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-5 sm:p-8"
            >
              <h2 className="font-display text-2xl font-semibold">1 · Pick a Zoom time</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a slot — then confirm by email to open your Zoom lobby.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Session</Label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={sessionTypeId}
                    onChange={(e) => setSessionTypeId(e.target.value)}
                  >
                    {(catalog.sessionTypes ?? []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
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
              </div>
              <div className="mt-4 space-y-2">
                <Label>Date</Label>
                <input
                  type="date"
                  className="flex h-11 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm"
                  value={date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  max={maxBookableDate(catalog.maxAdvanceDays)}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Available slots
                </p>
                {slotHint ? (
                  <p className="mb-3 rounded-xl bg-accent/10 px-3 py-2 text-sm text-foreground/80">
                    {slotHint}
                  </p>
                ) : null}
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : slots.some((s) => s.available) ? (
                  <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
                    {slots
                      .filter((slot) => slot.available)
                      .map((slot) => {
                        const selected = selectedSlot === slot.startsAt;
                        return (
                          <button
                            key={slot.startsAt}
                            type="button"
                            onClick={() => setSelectedSlot(slot.startsAt)}
                            className={cn(
                              "rounded-xl px-2 py-3 text-sm font-semibold transition",
                              !selected && "bg-muted/50 hover:bg-primary/15",
                              selected && "bg-[#0B1A24] text-accent ring-2 ring-accent/40",
                            )}
                          >
                            {formatSlotTime(slot.startsAt)}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                    No open times on this date. Choose another day above.
                  </p>
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  disabled={!selectedSlot}
                  onClick={() => setStep("details")}
                >
                  Continue to confirm <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "details" ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-5 sm:p-8"
            >
              <button
                type="button"
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"
                onClick={() => setStep("when")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="font-display text-2xl font-semibold">2 · Your details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirm by email — we create your learner access and open Zoom.
              </p>

              <div className="mt-6 rounded-2xl bg-[#0B1A24] p-4 text-sm text-white">
                <p className="font-medium">
                  {selectedType?.name} · {selectedInstructor?.fullName}
                </p>
                <p className="mt-1 text-white/65">
                  {selectedSlot ? formatSlotDateTime(selectedSlot) : ""}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <input
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Email</Label>
                <input
                  type="email"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="mt-4 space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  disabled={
                    submitting || !firstName.trim() || !lastName.trim() || !email.includes("@")
                  }
                  onClick={() => void holdAndSendOtp()}
                >
                  {submitting ? "Reserving…" : "Reserve & send code"}
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "otp" ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-5 sm:p-8"
            >
              <h2 className="font-display text-2xl font-semibold">3 · Enter code → Zoom</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the code sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              {demoOtp ? (
                <p className="mt-3 rounded-xl bg-accent/15 px-3 py-2 text-sm text-accent-foreground">
                  Demo OTP: <span className="font-mono font-semibold">{demoOtp}</span>
                </p>
              ) : null}
              <div className="mt-6 space-y-2">
                <Label>Verification code</Label>
                <input
                  className="flex h-12 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-center font-mono text-lg tracking-[0.35em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  maxLength={8}
                  placeholder="••••••"
                />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Confirming creates your student account and unlocks Zoom.
              </p>
              <div className="mt-8 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  disabled={submitting || otp.length < 4}
                  onClick={() => void verifyAndFinish()}
                >
                  {submitting ? "Confirming…" : "Confirm booking"}
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center sm:p-12"
            >
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-7 w-7" />
              </span>
              <h2 className="font-display text-2xl font-semibold">You&apos;re booked</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Account created and Zoom room prepared. Redirecting…
              </p>
              {redirectTo ? (
                <Button className="mt-6" variant="accent" onClick={() => router.push(redirectTo)}>
                  Continue
                </Button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { PublicBookingStudio };
