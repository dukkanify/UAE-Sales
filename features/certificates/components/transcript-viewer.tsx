"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CERTIFICATE_STATUS_LABELS } from "@/constants/certificates";
import { certFetch } from "@/features/certificates/lib/api";
import type { StudentTranscript } from "@/types/certificates";

function TranscriptViewer() {
  const [transcript, setTranscript] = React.useState<StudentTranscript | null>(null);

  React.useEffect(() => {
    void (async () => {
      const result = await certFetch<StudentTranscript>("/api/reports/transcript");
      setTranscript(result.data);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic transcript"
        description="Completed courses, certificates, quiz summary, and instructor evaluations."
        breadcrumbs={[{ label: "Student" }, { label: "Transcript" }]}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.location.href = "/api/reports/transcript?format=csv";
              }}
            >
              <Download className="size-4" />
              Excel / CSV
            </Button>
            <Button
              size="sm"
              onClick={() => window.open("/api/reports/transcript?format=pdf", "_blank")}
            >
              Print / PDF
            </Button>
          </div>
        }
      />

      {!transcript ? (
        <p className="text-sm text-muted-foreground">Generating transcript…</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">{transcript.studentName}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
              <p>{transcript.studentEmail}</p>
              <p>Overall {transcript.overallPerformance}</p>
              <p>
                {transcript.learningHours}h · Attendance {transcript.attendanceRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transcript.courses.map((c) => (
                <div
                  key={c.courseId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {c.code} · {c.courseTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.progressPercent}% · {c.learningHours}h
                      {c.quizAverage != null ? ` · Quiz ${c.quizAverage}%` : ""}
                    </p>
                  </div>
                  <Badge variant={c.completed ? "secondary" : "outline"}>
                    {c.completed ? "Completed" : "In progress"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Certificates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {transcript.certificates.map((c) => (
                  <div key={c.certificateNumber} className="flex justify-between gap-2">
                    <span>
                      {c.certificateNumber} · {c.courseName}
                    </span>
                    <Badge variant="outline">{CERTIFICATE_STATUS_LABELS[c.status]}</Badge>
                  </div>
                ))}
                {!transcript.certificates.length ? (
                  <p className="text-muted-foreground">None issued</p>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quiz summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Attempts: {transcript.quizSummary.attempts}</p>
                <p>Average: {transcript.quizSummary.averagePercent}%</p>
                <p>Pass rate: {transcript.quizSummary.passRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Button asChild variant="ghost" size="sm">
            <Link href="/student/certificates">Back to certificates</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export { TranscriptViewer };
