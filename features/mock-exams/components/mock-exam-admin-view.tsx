"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { MockExamSessionWithNames, MockExamSettings } from "@/types/mock-exams";
import { Award, CalendarCheck2, Clock3, FileBadge2 } from "lucide-react";

type Overview = {
  settings: MockExamSettings;
  examTypes: Array<{ id: string; name: string; basePrice: number; active: boolean }>;
  extraFees: Array<{ id: string; label: string; amount: number; active: boolean }>;
  counts: {
    total: number;
    pendingPayment: number;
    confirmed: number;
    completed: number;
    certificates: number;
  };
  recent: MockExamSessionWithNames[];
};

async function apiGet<T>(query: string): Promise<T> {
  const res = await fetch(`/api/mock-exams${query}`, { cache: "no-store" });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
  return json.data;
}

async function apiPost(body: Record<string, unknown>) {
  const res = await fetch("/api/mock-exams", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: unknown; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
  return json.data;
}

export function MockExamAdminView({ roleLabel = "Super Admin" }: { roleLabel?: string }) {
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pricingMode, setPricingMode] = React.useState<"fixed" | "dynamic">("dynamic");
  const [dayStart, setDayStart] = React.useState("9");
  const [dayEnd, setDayEnd] = React.useState("20");
  const [completeId, setCompleteId] = React.useState("");
  const [score, setScore] = React.useState("75");

  const refresh = React.useCallback(async () => {
    const overview = await apiGet<Overview>("?view=admin");
    setData(overview);
    setPricingMode(overview.settings.pricingMode);
    const mon = overview.settings.workingHours.find((w) => w.weekday === 1);
    if (mon) {
      setDayStart(String(mon.startHour));
      setDayEnd(String(mon.endHour));
    }
  }, []);

  React.useEffect(() => {
    void refresh().catch((err: Error) => setError(err.message));
  }, [refresh]);

  async function saveConfig() {
    try {
      const start = Number(dayStart);
      const end = Number(dayEnd);
      const workingHours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
        weekday,
        startHour: start,
        endHour: end,
        active: weekday !== 5,
      }));
      await apiPost({
        action: "update_settings",
        settings: { pricingMode, workingHours, enabled: true },
      });
      toast.success("Mock exam configuration saved");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function completeSession() {
    if (!completeId) return;
    try {
      await apiPost({
        action: "complete",
        sessionId: completeId,
        scorePercent: Number(score),
        passed: Number(score) >= 75,
        notes: "Session completed by admin",
      });
      toast.success("Session completed — certificate issued if passed");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Complete failed");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mock exam configuration"
        description="Working hours, dynamic pricing, extra fees, Zoom meetings, and certificates."
        breadcrumbs={[{ label: roleLabel }, { label: "Mock exams" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Sessions" value={data.counts.total} icon={CalendarCheck2} />
            <StatCard label="Confirmed" value={data.counts.confirmed} icon={Clock3} />
            <StatCard label="Completed" value={data.counts.completed} icon={Award} />
            <StatCard label="Certificates" value={data.counts.certificates} icon={FileBadge2} />
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Admin configuration</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] space-y-1.5">
                <Label>Pricing mode</Label>
                <Select
                  value={pricingMode}
                  onValueChange={(v) => setPricingMode(v as "fixed" | "dynamic")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Work start (UTC hour)</Label>
                <Input value={dayStart} onChange={(e) => setDayStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Work end (UTC hour)</Label>
                <Input value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} />
              </div>
              <Button onClick={() => void saveConfig()}>Save configuration</Button>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {data.examTypes.map((t) => (
                <Badge key={t.id} variant="secondary">
                  {t.name}: {formatMinor(t.basePrice, data.settings.currency)}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {data.extraFees.map((f) => (
                <Badge key={f.id} variant="outline">
                  {f.label}: {formatMinor(f.amount, data.settings.currency)}
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Complete session</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] space-y-1.5">
                <Label>Session</Label>
                <Select value={completeId} onValueChange={setCompleteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select confirmed session" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.recent
                      .filter((s) => s.status === "confirmed" || s.status === "in_progress")
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.examTypeName} · {s.studentName ?? s.studentId.slice(0, 6)} ·{" "}
                          {new Date(s.startsAt).toLocaleString()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Score %</Label>
                <Input value={score} onChange={(e) => setScore(e.target.value)} />
              </div>
              <Button onClick={() => void completeSession()}>Complete + certificate</Button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Recent sessions</h2>
            <ul className="space-y-2 text-sm">
              {data.recent.map((s) => (
                <li key={s.id} className="border-b border-border/60 pb-2">
                  <span className="font-medium">{s.examTypeName}</span> · {s.studentName} ·{" "}
                  <Badge variant="secondary">{s.status}</Badge>
                  <div className="text-muted-foreground">
                    {new Date(s.startsAt).toLocaleString()} ·{" "}
                    {formatMinor(s.quote.total, s.currency)}
                    {s.zoom ? " · Zoom ready" : ""}
                    {s.certificateId ? ` · Cert ${s.scorePercent}%` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
