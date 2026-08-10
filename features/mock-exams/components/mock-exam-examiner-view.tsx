"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMinor } from "@/lib/money";
import type { MockExamSessionWithNames } from "@/types/mock-exams";

export function MockExamExaminerView() {
  const [sessions, setSessions] = React.useState<MockExamSessionWithNames[]>([]);
  const [scores, setScores] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/mock-exams", { cache: "no-store" });
    const json = (await res.json()) as {
      success: boolean;
      data: MockExamSessionWithNames[];
      error: string | null;
    };
    if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
    setSessions(json.data);
  }, []);

  React.useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
  }, [load]);

  async function complete(sessionId: string) {
    const scorePercent = Number(scores[sessionId] ?? "75");
    const res = await fetch("/api/mock-exams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        sessionId,
        scorePercent,
        passed: scorePercent >= 75,
      }),
    });
    const json = (await res.json()) as { success: boolean; error: string | null };
    if (!res.ok || !json.success) {
      toast.error(json.error ?? "Failed");
      return;
    }
    toast.success("Session completed");
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mock exam sessions"
        description="Invigilate, complete sessions, and issue certificates."
        breadcrumbs={[{ label: "Instructor" }, { label: "Mock exams" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-4 text-sm">
        {sessions.length === 0 ? (
          <li className="text-muted-foreground">No assigned mock exam sessions.</li>
        ) : (
          sessions.map((s) => (
            <li key={s.id} className="border-b border-border/60 pb-4">
              <p className="font-medium">
                {s.examTypeName} · {s.studentName ?? "Student"} ·{" "}
                <Badge variant="secondary">{s.status}</Badge>
              </p>
              <p className="text-muted-foreground">
                {new Date(s.startsAt).toLocaleString()} · {formatMinor(s.quote.total, s.currency)}
              </p>
              {s.zoom ? (
                <a
                  className="text-primary hover:underline"
                  href={s.zoom.startUrl || s.zoom.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Start Zoom meeting
                </a>
              ) : null}
              {(s.status === "confirmed" || s.status === "in_progress") && (
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label>Score %</Label>
                    <Input
                      className="w-24"
                      value={scores[s.id] ?? "75"}
                      onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    />
                  </div>
                  <Button size="sm" onClick={() => void complete(s.id)}>
                    Complete session
                  </Button>
                </div>
              )}
              {s.certificateId ? (
                <p className="mt-1 text-muted-foreground">
                  Certificate issued · {s.scorePercent}% · {s.passed ? "PASS" : "FAIL"}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
