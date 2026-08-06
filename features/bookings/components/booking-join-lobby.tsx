"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Copy, ExternalLink, Radio, Shield, Video } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingFetch } from "@/features/bookings/lib/api";
import type { BookingJoinPayload } from "@/types/bookings";
import { routes } from "@/constants/routes";

interface BookingJoinLobbyProps {
  bookingId: string;
}

function BookingJoinLobby({ bookingId }: BookingJoinLobbyProps) {
  const [data, setData] = React.useState<BookingJoinPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await bookingFetch<BookingJoinPayload>(`/api/bookings/${bookingId}/join`, {
        method: "POST",
        body: "{}",
      });
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Unable to open Zoom lobby");
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  if (loading) {
    return (
      <div className="booking-aurora flex min-h-screen items-center justify-center px-4">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="relative z-10 w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-40 bg-white/10" />
          <Skeleton className="h-64 w-full rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="booking-aurora flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
        <div className="booking-grid-fade absolute inset-0" />
        <div className="relative z-10 max-w-md">
          <BrandLogo variant="dark" href={routes.home} />
          <h1 className="mt-8 font-display text-3xl font-semibold">Lobby locked</h1>
          <p className="mt-3 text-white/65">{error ?? "Session unavailable"}</p>
          <Button className="mt-8" variant="accent" asChild>
            <Link href="/student/bookings">Back to bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { booking, join, isHost, canJoin, joinWindowLabel } = data;
  const enterUrl = isHost && join.startUrl ? join.startUrl : join.joinUrl;

  return (
    <div className="booking-aurora relative min-h-screen overflow-hidden text-white">
      <div className="booking-grid-fade absolute inset-0" />
      <div className="booking-scan-line" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <BrandLogo variant="dark" href={routes.home} />
          <Badge className="bg-white/10 text-white hover:bg-white/10">
            <Radio className="mr-1.5 h-3 w-3 text-accent" />
            {join.providerMode === "zoom" ? "Live Zoom" : "Zoom mock"}
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="my-auto"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-accent">
            Pre-flight Zoom lobby
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {booking.title}
          </h1>
          <p className="mt-3 text-white/65">
            {new Date(booking.startsAt).toLocaleString()} · with{" "}
            {isHost ? booking.studentName : booking.instructorName}
          </p>

          <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <span className="booking-pulse absolute inset-0 rounded-full" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#0B1A24] ring-1 ring-white/20">
                    <Video className="h-6 w-6 text-accent" />
                  </span>
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Zoom meeting ready</p>
                  <p className="text-sm text-white/60">{joinWindowLabel}</p>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <Cred
                  label="Meeting ID"
                  value={join.meetingNumber}
                  onCopy={() => copy(join.meetingNumber)}
                />
                <Cred
                  label="Passcode"
                  value={join.password || "None"}
                  onCopy={join.password ? () => copy(join.password) : undefined}
                />
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Role
                  </p>
                  <p className="mt-1 text-sm">
                    {isHost ? "Host / Instructor" : "Participant"}
                    {join.waitingRoom ? " · Waiting room enabled" : ""}
                  </p>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="accent"
                  className="flex-1"
                  disabled={!canJoin}
                  asChild={canJoin}
                >
                  {canJoin ? (
                    <a href={enterUrl} target="_blank" rel="noreferrer">
                      {isHost ? "Start Zoom as host" : "Enter Zoom meeting"}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span>Waiting for join window</span>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => copy(enterUrl)}
                >
                  <Copy className="h-4 w-4" />
                  Copy link
                </Button>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-white/45">
                <Shield className="h-3.5 w-3.5" />
                Credentials are private to this booking. Do not share outside AviatorPass.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Cred({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="rounded-2xl bg-black/25 px-4 py-3 ring-1 ring-white/10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-lg font-semibold tracking-wide">{value}</p>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export { BookingJoinLobby };
