"use client";

import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { PERFORMANCE_RATING_LABELS } from "@/constants/performance-reports";
import type { PerformanceReportWithNames } from "@/types/performance-reports";

async function fetchReports(query: string): Promise<PerformanceReportWithNames[]> {
  const res = await fetch(`/api/performance-reports${query}`, { cache: "no-store" });
  const json = (await res.json()) as {
    success: boolean;
    data: PerformanceReportWithNames[] | { recent: PerformanceReportWithNames[] };
    error: string | null;
  };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load reports");
  if (Array.isArray(json.data)) return json.data;
  return json.data.recent ?? [];
}

export function PerformanceReportsList({
  title,
  description,
  breadcrumbs,
  query = "",
  emptyLabel = "No performance reports yet.",
}: {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  query?: string;
  emptyLabel?: string;
}) {
  const [reports, setReports] = React.useState<PerformanceReportWithNames[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    void fetchReports(query)
      .then((rows) => {
        setReports(rows);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="border-b border-border/60 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{r.classTitle}</p>
                {r.courseCode ? <Badge variant="secondary">{r.courseCode}</Badge> : null}
                <Badge>{PERFORMANCE_RATING_LABELS[r.performance]}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.instructorName ? `Instructor: ${r.instructorName} · ` : ""}
                {r.studentName ? `Student: ${r.studentName} · ` : ""}
                {new Date(r.createdAt).toLocaleString()}
              </p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Today&apos;s Topic</dt>
                  <dd>{r.todaysTopic}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Next Topic</dt>
                  <dd>{r.nextTopic}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Homework</dt>
                  <dd>{r.homework}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Question Bank</dt>
                  <dd>{r.questionBank}</dd>
                </div>
              </dl>
              {r.comments ? (
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">Comments: </span>
                  {r.comments}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {r.emailSentAt
                  ? `Email sent ${new Date(r.emailSentAt).toLocaleString()}`
                  : "Email not sent"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
