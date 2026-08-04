"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { certFetch } from "@/features/certificates/lib/api";
import type {
  AdminReportBundle,
  ExecutiveReportBundle,
  InstructorReportBundle,
} from "@/types/certificates";

interface ReportsDashboardViewProps {
  roleLabel: string;
  scope: "instructor" | "admin" | "executive";
}

function ReportsDashboardView({ roleLabel, scope }: ReportsDashboardViewProps) {
  const [data, setData] = React.useState<
    InstructorReportBundle | AdminReportBundle | ExecutiveReportBundle | null
  >(null);

  React.useEffect(() => {
    void (async () => {
      const result = await certFetch<
        InstructorReportBundle | AdminReportBundle | ExecutiveReportBundle
      >(`/api/reports/overview?scope=${scope}`);
      setData(result.data);
    })();
  }, [scope]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          scope === "executive"
            ? "Executive reports"
            : scope === "admin"
              ? "Admin reports"
              : "Instructor reports"
        }
        description="Academic performance, certificates, attendance, and platform engagement."
        breadcrumbs={[{ label: roleLabel }, { label: "Reports" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.location.href = `/api/reports/overview?scope=${scope}&format=csv`;
            }}
          >
            <Download className="size-4" />
            Export CSV / Excel
          </Button>
        }
      />

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading reports…</p>
      ) : scope === "instructor" ? (
        <InstructorBlocks data={data as InstructorReportBundle} />
      ) : scope === "admin" ? (
        <AdminBlocks data={data as AdminReportBundle} />
      ) : (
        <ExecutiveBlocks data={data as ExecutiveReportBundle} />
      )}
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

function InstructorBlocks({ data }: { data: InstructorReportBundle }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Students" value={data.studentsTracked} />
        <Stat label="Courses" value={data.coursesOwned} />
        <Stat label="Avg progress" value={`${data.averageStudentProgress}%`} />
        <Stat label="Attendance" value={`${data.attendanceRate}%`} />
        <Stat label="Completion" value={`${data.courseCompletionRate}%`} />
        <Stat label="Quiz average" value={`${data.quizAverage}%`} />
        <Stat label="Certificates" value={data.certificatesIssued} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.studentRows.map((s) => (
            <div
              key={s.studentId}
              className="flex justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm"
            >
              <span>{s.studentName}</span>
              <span className="text-muted-foreground">
                {Math.round(s.progressPercent)}% · Quiz {s.quizAverage}% · Certs{" "}
                {s.certificates}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function AdminBlocks({ data }: { data: AdminReportBundle }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Students" value={data.students} />
      <Stat label="Instructors" value={data.instructors} />
      <Stat label="Courses" value={data.courses} />
      <Stat label="Live classes" value={data.liveClasses} />
      <Stat label="Certificates issued" value={data.certificatesIssued} />
      <Stat label="Pending certificates" value={data.certificatesPending} />
      <Stat label="Attendance" value={`${data.averageAttendance}%`} />
      <Stat label="Completion" value={`${data.averageCompletion}%`} />
      <Stat label="Quiz pass rate" value={`${data.quizPassRate}%`} />
      <Stat label="Active users" value={data.platformActiveUsers} />
    </div>
  );
}

function ExecutiveBlocks({ data }: { data: ExecutiveReportBundle }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Graduates" value={data.totalGraduates} />
        <Stat label="Certificates issued" value={data.certificatesIssued} />
        <Stat label="Active students" value={data.activeStudents} />
        <Stat label="Course success" value={`${data.courseSuccessRate}%`} />
        <Stat label="Learning hours" value={data.platformEngagement.learningHours} />
        <Stat label="Quiz attempts" value={data.platformEngagement.quizAttempts} />
        <Stat label="Live attendance" value={data.platformEngagement.liveAttendance} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructor performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.instructorPerformance.map((i) => (
              <div key={i.instructorId} className="flex justify-between gap-2">
                <span>{i.instructorName}</span>
                <span className="text-muted-foreground">
                  {i.students} students · {i.avgProgress}% · {i.certificates} certs
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.monthlyGrowth.map((m) => (
              <div key={m.month} className="flex justify-between gap-2">
                <span>{m.month}</span>
                <span className="text-muted-foreground">
                  +{m.students} students · {m.certificates} certs
                </span>
              </div>
            ))}
            {!data.monthlyGrowth.length ? (
              <p className="text-muted-foreground">No trend data yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export { ReportsDashboardView };
