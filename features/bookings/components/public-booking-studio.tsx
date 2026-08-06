"use client";

import * as React from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Check, Clock, Radio, Shield, Video } from "lucide-react";
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
  const openSlots = slots.filter((s) => s.available);

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
      <div className="booking-aurora relative min-h-[70vh] overflow-hidden rounded-3xl">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center text-white/75">
          <p>{catalogError ?? "Opening booking studio…"}</p>
          {catalogError ? (
            <Button variant="accent" onClick={() => void loadCatalog()}>
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
          Public booking is paused. Enter the platform if you already have an account.
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
        {step === "when" ? (
          <div className="p-5 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">1 · Pick a Zoom time</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a slot — then confirm by email to open your Zoom lobby.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-type">Session</Label>
                <select
                  id="session-type"
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
                <Label htmlFor="instructor">Instructor</Label>
                <select
                  id="instructor"
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
              <Label htmlFor="book-date">Date</Label>
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
                <p className="text-sm text-muted-foreground">Loading open times…</p>
              ) : openSlots.length > 0 ? (
                <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
                  {openSlots.map((slot) => {
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
          </div>
        ) : null}

        {step === "details" ? (
          <div className="p-5 sm:p-8">
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
                <Label htmlFor="first-name">First name</Label>
                <input
                  id="first-name"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <input
                  id="last-name"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
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
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
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
              />
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
          </div>
        ) : null}

        {step === "otp" ? (
          <div className="p-5 sm:p-8">
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
              <Label htmlFor="otp">Verification code</Label>
              <input
                id="otp"
                className="flex h-12 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-center font-mono text-lg tracking-[0.35em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                maxLength={8}
                placeholder="••••••"
                inputMode="numeric"
                autoComplete="one-time-code"
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
          </div>
        ) : null}

        {step === "done" ? (
          <div className="p-8 text-center sm:p-12">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-7 w-7" />
            </span>
            <h2 className="font-display text-2xl font-semibold">You&apos;re booked</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Account created and Zoom room prepared. Redirecting…
            </p>
            {redirectTo ? (
              <Button className="mt-6" variant="accent" onClick={() => router.push(redirectTo)}>
                Open Zoom lobby
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { PublicBookingStudio };
