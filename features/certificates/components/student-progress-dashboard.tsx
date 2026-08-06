"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { certFetch } from "@/features/certificates/lib/api";
import type { ProgressTimelineEvent, StudentProgressSnapshot } from "@/types/certificates";

function StudentProgressDashboard() {
  const [snap, setSnap] = React.useState<StudentProgressSnapshot | null>(null);
  const [timeline, setTimeline] = React.useState<ProgressTimelineEvent[]>([]);

  React.useEffect(() => {
    void (async () => {
      const [s, t] = await Promise.all([
        certFetch<StudentProgressSnapshot>("/api/reports/progress"),
        certFetch<ProgressTimelineEvent[]>("/api/reports/progress?view=timeline"),
      ]);
      setSnap(s.data);
      setTimeline(t.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic progress"
        description="Courses, quizzes, attendance, study streak, and your learning timeline."
        breadcrumbs={[{ label: "Student" }, { label: "Progress" }]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/student/transcript">Transcript</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/student/certificates">Certificates</Link>
            </Button>
          </div>
        }
      />

      {snap ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Overall progress" value={`${Math.round(snap.overallPercent)}%`} />
            <Stat label="Learning hours" value={`${snap.learningHours}h`} />
            <Stat label="Study streak" value={`${snap.studyStreakDays}d`} />
            <Stat label="Quiz average" value={`${snap.averageQuizScore}%`} />
            <Stat label="Attendance" value={`${snap.attendanceRate}%`} />
            <Stat label="Quiz pass rate" value={`${snap.quizPassRate}%`} />
            <Stat label="Certificates" value={snap.certificatesIssued} />
            <Stat label="Lessons completed" value={snap.lessonsCompleted} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {snap.courseProgress.map((c) => (
                <div key={c.courseId}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{c.courseTitle}</span>
                    <span className="text-muted-foreground">
                      {c.completedLessons}/{c.totalLessons} · {Math.round(c.percent)}%
                    </span>
                  </div>
                  <Progress value={c.percent} />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Loading progress…</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline.map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/70 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(e.at).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline">{e.type.replace(/_/g, " ")}</Badge>
            </div>
          ))}
          {!timeline.length ? (
            <p className="text-sm text-muted-foreground">No timeline events yet.</p>
          ) : null}
        </CardContent>
      </Card>
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

export { StudentProgressDashboard };
