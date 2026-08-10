"use client";

import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

type ClassRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: string;
  instructorId: string;
};

export function CgiScheduleView({ initialClasses }: { initialClasses: ClassRow[] }) {
  const [classes, setClasses] = React.useState(initialClasses);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function reschedule(row: ClassRow) {
    setBusyId(row.id);
    setError(null);
    try {
      const start = new Date(Date.parse(row.startsAt) + 24 * 60 * 60 * 1000);
      const end = new Date(Date.parse(row.endsAt) + 24 * 60 * 60 * 1000);
      const res = await fetch("/api/cgi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "reschedule_class",
          liveClassId: row.id,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data: ClassRow | null;
        error: string | null;
      };
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error ?? "Reschedule failed");
      }
      setClasses((prev) =>
        prev.map((c) =>
          c.id === row.id
            ? {
                ...c,
                id: json.data!.id,
                startsAt: json.data!.startsAt,
                endsAt: json.data!.endsAt,
                status: json.data!.status,
              }
            : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        description="Reschedule any ATPL live class across instructors."
        breadcrumbs={[{ label: "CGI" }, { label: "Schedule" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-3">
        {classes.length === 0 ? (
          <li className="text-sm text-muted-foreground">No live classes scheduled.</li>
        ) : (
          classes.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3"
            >
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(row.startsAt).toLocaleString()} · {row.status}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={busyId === row.id || row.status === "cancelled"}
                onClick={() => void reschedule(row)}
              >
                Reschedule +1 day
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
