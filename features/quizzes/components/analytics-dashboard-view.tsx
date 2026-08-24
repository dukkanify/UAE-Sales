"use client";

import * as React from "react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { quizFetch } from "@/features/quizzes/lib/api";
import type { AssessmentAnalyticsSnapshot, QuizListItem } from "@/types/quizzes";

interface AnalyticsDashboardViewProps {
  basePath?: string;
}

function AnalyticsDashboardView({
  basePath = "/instructor/quizzes",
}: AnalyticsDashboardViewProps) {
  const [quizzes, setQuizzes] = React.useState<QuizListItem[]>([]);
  const [quizId, setQuizId] = React.useState("");
  const [stats, setStats] = React.useState<AssessmentAnalyticsSnapshot | null>(null);

  React.useEffect(() => {
    void (async () => {
      const result = await quizFetch<{ data: QuizListItem[] }>("/api/quizzes?pageSize=50");
      const rows = result.data?.data ?? [];
      setQuizzes(rows);
      if (rows[0]) setQuizId(rows[0].id);
    })();
  }, []);

  React.useEffect(() => {
    if (!quizId) return;
    void (async () => {
      const result = await quizFetch<AssessmentAnalyticsSnapshot>(
        `/api/quizzes/analytics?quizId=${quizId}`,
      );
      setStats(result.data);
    })();
  }, [quizId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment analytics"
        description="Average scores, pass rates, timing, and frequently missed questions."
        breadcrumbs={[
          { label: "Quizzes", href: basePath },
          { label: "Analytics" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={basePath}>Back</Link>
          </Button>
        }
      />

      <select
        className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
        value={quizId}
        onChange={(e) => setQuizId(e.target.value)}
      >
        {quizzes.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>

      {stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Attempts" value={stats.attemptsCount} />
            <Stat label="Average score" value={`${stats.averageScore}%`} />
            <Stat label="Pass rate" value={`${stats.passRate}%`} />
            <Stat label="Avg time" value={`${Math.round(stats.averageTimeSeconds / 60)} min`} />
            <Stat label="Highest" value={`${stats.highestScore}%`} />
            <Stat label="Lowest" value={`${stats.lowestScore}%`} />
            <Stat label="Failure rate" value={`${stats.failureRate}%`} />
            <Stat label="Completed" value={stats.completedCount} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frequently missed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.frequentlyMissed.map((q) => (
                <div
                  key={q.questionId}
                  className="flex justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <span className="line-clamp-2">{q.stem}</span>
                  <span className="shrink-0 text-muted-foreground">{q.missRate}% miss</span>
                </div>
              ))}
              {!stats.frequentlyMissed.length ? (
                <p className="text-sm text-muted-foreground">No attempt data yet.</p>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="font-display text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}

export { AnalyticsDashboardView };
