"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMinor } from "@/lib/money";
import type {
  MockExamExtraFee,
  MockExamSessionWithNames,
  MockExamSlot,
  MockExamType,
} from "@/types/mock-exams";

type Catalog = {
  settings: { enabled: boolean; currency: string; pricingMode: string };
  examTypes: MockExamType[];
  extraFees: MockExamExtraFee[];
  examiners: Array<{ id: string; name: string; email: string }>;
};

async function apiGet<T>(query: string): Promise<T> {
  const res = await fetch(`/api/mock-exams${query}`, { cache: "no-store" });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function apiPost(body: Record<string, unknown>) {
  const res = await fetch("/api/mock-exams", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: unknown; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function MockExamBookingView() {
  const [catalog, setCatalog] = React.useState<Catalog | null>(null);
  const [sessions, setSessions] = React.useState<MockExamSessionWithNames[]>([]);
  const [examTypeId, setExamTypeId] = React.useState("");
  const [examinerId, setExaminerId] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [extras, setExtras] = React.useState<string[]>([]);
  const [slots, setSlots] = React.useState<MockExamSlot[]>([]);
  const [selectedStart, setSelectedStart] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [c, s] = await Promise.all([
      apiGet<Catalog>("?view=catalog"),
      apiGet<MockExamSessionWithNames[]>("?view=sessions"),
    ]);
    setCatalog(c);
    setSessions(s);
    if (!examTypeId && c.examTypes[0]) setExamTypeId(c.examTypes[0].id);
    if (!examinerId && c.examiners[0]) setExaminerId(c.examiners[0].id);
  }, [examTypeId, examinerId]);

  React.useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
  }, [load]);

  React.useEffect(() => {
    if (!examTypeId || !examinerId || !date) return;
    const q = new URLSearchParams({
      view: "slots",
      date,
      examinerId,
      examTypeId,
      extras: extras.join(","),
    });
    void apiGet<MockExamSlot[]>(`?${q}`)
      .then((rows) => {
        setSlots(rows.filter((s) => s.available));
        setSelectedStart("");
      })
      .catch((err: Error) => setError(err.message));
  }, [examTypeId, examinerId, date, extras]);

  async function book() {
    if (!selectedStart) {
      toast.error("Select a time slot");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiPost({
        action: "book",
        examinerId,
        examTypeId,
        startsAt: selectedStart,
        selectedExtraFeeIds: extras,
        markPaid: true,
      });
      toast.success("Mock exam booked — Zoom meeting ready");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  const selectedSlot = slots.find((s) => s.startsAt === selectedStart);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mock exam booking"
        description="Book an invigilated mock exam with dynamic pricing, extra fees, and automatic Zoom."
        breadcrumbs={[{ label: "Student" }, { label: "Mock exams" }]}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!catalog ? (
        <p className="text-sm text-muted-foreground">Loading catalog…</p>
      ) : !catalog.settings.enabled ? (
        <p className="text-sm text-muted-foreground">Mock exam booking is currently disabled.</p>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">Pricing: {catalog.settings.pricingMode}</Badge>
            <Badge variant="secondary">{catalog.settings.currency}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Exam type</Label>
              <Select value={examTypeId} onValueChange={setExamTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.examTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} · {t.durationMinutes}m ·{" "}
                      {formatMinor(t.basePrice, catalog.settings.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Examiner</Label>
              <Select value={examinerId} onValueChange={setExaminerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select examiner" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.examiners.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Extra fees</Label>
            <div className="flex flex-wrap gap-4">
              {catalog.extraFees.map((fee) => (
                <label key={fee.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={extras.includes(fee.id)}
                    onCheckedChange={(checked) => {
                      setExtras((prev) =>
                        checked ? [...prev, fee.id] : prev.filter((id) => id !== fee.id),
                      );
                    }}
                  />
                  {fee.label} ({formatMinor(fee.amount, catalog.settings.currency)})
                  {fee.autoApply ? " · auto" : ""}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Available slots</Label>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open slots for this day.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <Button
                    key={s.startsAt}
                    size="sm"
                    variant={selectedStart === s.startsAt ? "default" : "outline"}
                    onClick={() => setSelectedStart(s.startsAt)}
                  >
                    {new Date(s.startsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {s.quote ? ` · ${formatMinor(s.quote.total, s.quote.currency)}` : ""}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {selectedSlot?.quote ? (
            <div className="space-y-1 text-sm">
              <p>
                Base: {formatMinor(selectedSlot.quote.baseAmount, selectedSlot.quote.currency)} ×{" "}
                {selectedSlot.quote.multiplier} ={" "}
                {formatMinor(selectedSlot.quote.adjustedBase, selectedSlot.quote.currency)}
              </p>
              {selectedSlot.quote.extraFees.map((f) => (
                <p key={f.code} className="text-muted-foreground">
                  + {f.label}: {formatMinor(f.amount, selectedSlot.quote!.currency)}
                </p>
              ))}
              <p className="font-medium">
                Total: {formatMinor(selectedSlot.quote.total, selectedSlot.quote.currency)}
              </p>
            </div>
          ) : null}

          <Button disabled={busy || !selectedStart} onClick={() => void book()}>
            {busy ? "Booking…" : "Book mock exam"}
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">My mock exams</h2>
        <ul className="space-y-3 text-sm">
          {sessions.length === 0 ? (
            <li className="text-muted-foreground">No mock exams booked yet.</li>
          ) : (
            sessions.map((s) => (
              <li key={s.id} className="border-b border-border/60 pb-3">
                <p className="font-medium">
                  {s.examTypeName} · <Badge variant="secondary">{s.status}</Badge>
                </p>
                <p className="text-muted-foreground">
                  {new Date(s.startsAt).toLocaleString()} · Examiner: {s.examinerName ?? "—"} ·{" "}
                  {formatMinor(s.quote.total, s.currency)}
                </p>
                {s.zoom ? (
                  <a
                    className="text-primary hover:underline"
                    href={s.zoom.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join Zoom meeting
                  </a>
                ) : null}
                {s.certificateId ? (
                  <p className="text-muted-foreground">
                    Certificate issued · score {s.scorePercent ?? "—"}%
                  </p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
