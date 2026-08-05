"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { bookingFetch, bookingJson } from "@/features/bookings/lib/api";
import type { BookingListItem, BookingSettings } from "@/types/bookings";
import type { UserProfile } from "@/types";

interface AdminBookingViewProps {
  roleLabel: string;
}

function AdminBookingView({ roleLabel }: AdminBookingViewProps) {
  const [settings, setSettings] = React.useState<BookingSettings | null>(null);
  const [bookings, setBookings] = React.useState<BookingListItem[]>([]);
  const [instructors, setInstructors] = React.useState<UserProfile[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [tab, setTab] = React.useState<"settings" | "bookings">("bookings");

  const load = React.useCallback(async () => {
    const [s, b, meta] = await Promise.all([
      bookingFetch<BookingSettings>("/api/bookings/settings"),
      bookingFetch<BookingListItem[]>("/api/bookings"),
      bookingFetch<{ instructors: UserProfile[] }>("/api/bookings/slots?meta=1"),
    ]);
    if (s.success && s.data) setSettings(s.data);
    if (b.success && b.data) setBookings(b.data);
    if (meta.success && meta.data) setInstructors(meta.data.instructors);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings(patch: Partial<BookingSettings>) {
    if (!settings) return;
    setSaving(true);
    const res = await bookingJson<BookingSettings>("/api/bookings/settings", "PATCH", patch);
    setSaving(false);
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Could not save");
      return;
    }
    setSettings(res.data);
    toast.success("Booking settings updated");
  }

  async function setStatus(id: string, status: string) {
    const res = await bookingJson("/api/bookings/" + id, "PATCH", { status });
    if (!res.success) {
      toast.error(res.error ?? "Update failed");
      return;
    }
    toast.success(`Marked ${status}`);
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Control 24/7 Zoom self-booking and manage appointments."
        breadcrumbs={[{ label: roleLabel }, { label: "Bookings" }]}
        actions={
          <div className="inline-flex rounded-xl border border-border/70 bg-card p-1 shadow-soft">
            <button
              type="button"
              onClick={() => setTab("bookings")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                tab === "bookings" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Appointments
            </button>
            <button
              type="button"
              onClick={() => setTab("settings")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                tab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Controls
            </button>
          </div>
        }
      />

      {tab === "settings" && settings ? (
        <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
          <div className="relative overflow-hidden rounded-xl bg-[#0B1A24] px-5 py-5 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 90% at 100% 0%, rgba(46,125,170,0.4), transparent 55%)",
              }}
            />
            <div className="relative z-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                Admin control
              </p>
              <p className="mt-1 font-display text-xl font-semibold">Booking gate</p>
              <p className="mt-1 text-sm text-white/65">
                Clients book themselves; you decide availability and confirmation rules.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ToggleRow
              label="Booking enabled"
              description="When off, students cannot create new bookings."
              checked={settings.enabled}
              onChange={(v) => void saveSettings({ enabled: v })}
            />
            <ToggleRow
              label="Book before registration"
              description="Guests can reserve on /book, then confirm by email OTP (account created automatically)."
              checked={settings.allowGuestBooking}
              onChange={(v) => void saveSettings({ allowGuestBooking: v })}
            />
            <ToggleRow
              label="Around the clock (24/7)"
              description="Offer slots every hour of the day."
              checked={settings.aroundTheClock}
              onChange={(v) => void saveSettings({ aroundTheClock: v })}
            />
            <ToggleRow
              label="Require admin confirmation"
              description="New bookings stay pending until you confirm."
              checked={settings.requireConfirmation}
              onChange={(v) => void saveSettings({ requireConfirmation: v })}
            />
            <ToggleRow
              label="Auto-create Zoom room"
              description="Provision Zoom meeting IDs when a booking is confirmed."
              checked={settings.autoCreateZoom}
              onChange={(v) => void saveSettings({ autoCreateZoom: v })}
            />
            <ToggleRow
              label="Zoom waiting room"
              description="Hold participants until the host admits them."
              checked={settings.zoomWaitingRoom}
              onChange={(v) => void saveSettings({ zoomWaitingRoom: v })}
            />
            <ToggleRow
              label="Zoom passcode"
              description="Require a passcode for every booking meeting."
              checked={settings.zoomPasscode}
              onChange={(v) => void saveSettings({ zoomPasscode: v })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Slot duration (min)"
              type="number"
              value={settings.slotDurationMinutes}
              onCommit={(v) => void saveSettings({ slotDurationMinutes: Number(v) })}
            />
            <Field
              label="Max advance days"
              type="number"
              value={settings.maxAdvanceDays}
              onCommit={(v) => void saveSettings({ maxAdvanceDays: Number(v) })}
            />
            <Field
              label="Min notice (min)"
              type="number"
              value={settings.minNoticeMinutes}
              onCommit={(v) => void saveSettings({ minNoticeMinutes: Number(v) })}
            />
          </div>

          {!settings.aroundTheClock ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Day start hour (0–23)"
                type="number"
                value={settings.dayStartHour}
                onCommit={(v) => void saveSettings({ dayStartHour: Number(v) })}
              />
              <Field
                label="Day end hour (1–24)"
                type="number"
                value={settings.dayEndHour}
                onCommit={(v) => void saveSettings({ dayEndHour: Number(v) })}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Bookable instructors</Label>
            <p className="text-xs text-muted-foreground">
              Leave all unchecked to allow every active instructor.
            </p>
            <div className="flex flex-wrap gap-2">
              {instructors.map((i) => {
                const selected =
                  settings.instructorIds.length === 0 || settings.instructorIds.includes(i.id);
                const lockedEmpty = settings.instructorIds.length === 0;
                return (
                  <button
                    key={i.id}
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      let next: string[];
                      if (lockedEmpty) {
                        // Start from all, then toggle this one off
                        next = instructors.filter((x) => x.id !== i.id).map((x) => x.id);
                      } else if (settings.instructorIds.includes(i.id)) {
                        next = settings.instructorIds.filter((id) => id !== i.id);
                      } else {
                        next = [...settings.instructorIds, i.id];
                      }
                      if (next.length === instructors.length) next = [];
                      void saveSettings({ instructorIds: next });
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium ring-1 transition ${
                      selected
                        ? "bg-primary/10 text-primary ring-primary/30"
                        : "bg-muted/40 text-muted-foreground ring-border"
                    }`}
                  >
                    {i.fullName || i.email}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Session types</Label>
            <ul className="mt-2 space-y-2">
              {settings.sessionTypes.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.durationMinutes} min · {t.description}
                    </p>
                  </div>
                  <Badge variant={t.active ? "default" : "outline"}>
                    {t.active ? "Active" : "Off"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "bookings" ? (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card px-6 py-14 text-center">
              <p className="font-display text-lg font-semibold">No bookings yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                When students book, appointments appear here for control.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {b.studentName} · {new Date(b.startsAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{b.status}</Badge>
                  {b.zoom ? <Badge variant="secondary">Zoom · {b.zoom.meetingNumber}</Badge> : null}
                  {b.status === "confirmed" ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/bookings/join/${b.id}`}>Zoom lobby</a>
                    </Button>
                  ) : null}
                  {b.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => void setStatus(b.id, "confirmed")}
                    >
                      Confirm + Zoom
                    </Button>
                  ) : null}
                  {b.status === "confirmed" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void setStatus(b.id, "completed")}
                    >
                      Complete
                    </Button>
                  ) : null}
                  {b.status === "pending" || b.status === "confirmed" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void setStatus(b.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onCommit,
}: {
  label: string;
  type: string;
  value: number;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = React.useState(String(value));
  React.useEffect(() => setLocal(String(value)), [value]);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        type={type}
        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== String(value)) onCommit(local);
        }}
      />
    </div>
  );
}

export { AdminBookingView };
