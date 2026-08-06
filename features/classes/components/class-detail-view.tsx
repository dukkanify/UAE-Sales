"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { ArrowLeft, ExternalLink, Radio } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUSES,
  LIVE_CLASS_STATUS_LABELS,
} from "@/constants/classes";
import { classFetch } from "@/features/classes/lib/api";
import type { AttendanceWithStudent, LiveClassListItem } from "@/types/classes";

interface ClassDetailViewProps {
  classId: string;
  basePath: string;
  roleLabel: string;
}

function ClassDetailView({ classId, basePath, roleLabel }: ClassDetailViewProps) {
  const [detail, setDetail] = React.useState<
    | (LiveClassListItem & {
        zoom: {
          zoomMeetingId: string;
          joinUrl: string;
          password: string;
          waitingRoom: boolean;
          providerMode: string;
        } | null;
        participants: Array<{ userId: string; role: string }>;
        recordings: Array<{ id: string; title: string; url: string }>;
      })
    | null
  >(null);
  const [attendance, setAttendance] = React.useState<AttendanceWithStudent[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [d, a] = await Promise.all([
      classFetch<NonNullable<typeof detail>>(`/api/classes/${classId}`),
      classFetch<AttendanceWithStudent[]>(`/api/classes/${classId}/attendance`),
    ]);
    setDetail(d.data);
    setAttendance(a.data ?? []);
    setLoading(false);
  }, [classId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function setAttendanceStatus(studentId: string, status: string) {
    const result = await classFetch(`/api/classes/${classId}/attendance`, {
      method: "POST",
      body: JSON.stringify({ studentId, status }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed");
      return;
    }
    toast.success("Attendance updated");
    void load();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Class not found.</p>
        <Button asChild variant="outline">
          <Link href={basePath}>Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.title}
        description={`${LIVE_CLASS_STATUS_LABELS[detail.status]} · ${new Date(detail.startsAt).toLocaleString()}`}
        breadcrumbs={[
          { label: roleLabel },
          { label: "Classes", href: basePath },
          { label: detail.title },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/join/${detail.id}`}>
                <Radio className="mr-2 h-4 w-4" /> Join / Start
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>{detail.description || "No description"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Course:</span> {detail.courseCode ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Instructor:</span>{" "}
              {detail.instructorName ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Duration:</span> {detail.durationMinutes} min
            </p>
            <p>
              <span className="text-muted-foreground">Timezone:</span> {detail.timezone}
            </p>
            <p>
              <span className="text-muted-foreground">Students:</span> {detail.enrolledCount}/
              {detail.maxStudents}
            </p>
            <Badge className="w-fit">{detail.computedStatus}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zoom meeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {detail.zoom ? (
              <>
                <p>
                  <span className="text-muted-foreground">Meeting ID:</span>{" "}
                  {detail.zoom.zoomMeetingId}
                </p>
                <p>
                  <span className="text-muted-foreground">Passcode:</span>{" "}
                  {detail.zoom.password || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Mode:</span> {detail.zoom.providerMode}
                </p>
                <p>
                  <span className="text-muted-foreground">Waiting room:</span>{" "}
                  {detail.zoom.waitingRoom ? "On" : "Off"}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <a href={detail.zoom.joinUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open join URL
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No Zoom meeting linked.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance panel</CardTitle>
              <CardDescription>Foundation statuses — analytics come later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {detail.participants.filter((p) => p.role === "participant").length === 0 ? (
                <p className="text-sm text-muted-foreground">No student participants.</p>
              ) : (
                detail.participants
                  .filter((p) => p.role === "participant")
                  .map((p) => {
                    const row = attendance.find((a) => a.studentId === p.userId);
                    return (
                      <div
                        key={p.userId}
                        className="flex flex-col gap-2 rounded-xl border border-border/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">{row?.studentName ?? p.userId.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {row
                              ? `${ATTENDANCE_STATUS_LABELS[row.status]} · ${row.attendancePercent}%`
                              : "Not marked"}
                          </p>
                        </div>
                        <Select
                          value={row?.status ?? "unknown"}
                          onValueChange={(v) => void setAttendanceStatus(p.userId, v)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {ATTENDANCE_STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recordings</CardTitle>
              <CardDescription>Metadata architecture only — no video processing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(detail.recordings ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No recordings registered.</p>
              ) : (
                detail.recordings.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    className="block text-sm text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {r.title}
                  </a>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { ClassDetailView };
