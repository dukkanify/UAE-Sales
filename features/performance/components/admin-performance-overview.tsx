"use client";

import * as React from "react";
import { ClipboardList, Mail, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { PERFORMANCE_RATING_LABELS, PERFORMANCE_RATINGS } from "@/constants/performance-reports";
import type { PerformanceReportWithNames } from "@/types/performance-reports";

type Overview = {
  total: number;
  studentsCovered: number;
  emailed: number;
  byRating: Record<string, number>;
  recent: PerformanceReportWithNames[];
};

export function AdminPerformanceOverview() {
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void fetch("/api/performance-reports?view=overview", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as {
          success: boolean;
          data: Overview;
          error: string | null;
        };
        if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
        setData(json.data);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance reports"
        description="Post-lecture student evaluations from instructors — visible to Super Admin."
        breadcrumbs={[{ label: "Super Admin" }, { label: "Performance reports" }]}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total reports" value={data.total} icon={ClipboardList} />
            <StatCard label="Students covered" value={data.studentsCovered} icon={Users} />
            <StatCard label="Emails sent" value={data.emailed} icon={Mail} />
          </div>
          <div className="flex flex-wrap gap-2">
            {PERFORMANCE_RATINGS.map((r) => (
              <Badge key={r} variant="secondary">
                {PERFORMANCE_RATING_LABELS[r]}: {data.byRating[r] ?? 0}
              </Badge>
            ))}
          </div>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Recent reports</h2>
            <ul className="space-y-3 text-sm">
              {data.recent.length === 0 ? (
                <li className="text-muted-foreground">No reports submitted yet.</li>
              ) : (
                data.recent.map((r) => (
                  <li key={r.id} className="border-b border-border/60 pb-3">
                    <p className="font-medium">
                      {r.studentName ?? "Student"} · {r.classTitle} ·{" "}
                      {PERFORMANCE_RATING_LABELS[r.performance]}
                    </p>
                    <p className="text-muted-foreground">
                      Today: {r.todaysTopic} · Next: {r.nextTopic} · QB: {r.questionBank}
                    </p>
                    <p className="text-muted-foreground">
                      Instructor: {r.instructorName ?? "—"} ·{" "}
                      {new Date(r.createdAt).toLocaleString()}
                      {r.emailSentAt ? " · emailed" : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
