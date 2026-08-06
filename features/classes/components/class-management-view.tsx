"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Copy, MoreHorizontal, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { LIVE_CLASS_STATUS_LABELS, LIVE_CLASS_STATUSES } from "@/constants/classes";
import { classFetch } from "@/features/classes/lib/api";
import { ClassFormDialog } from "@/features/classes/components/class-form-dialog";
import { ClassStatsWidgets } from "@/features/classes/components/class-stats-widgets";
import type { LiveClassListItem } from "@/types/classes";
import type { CourseListItem } from "@/types/courses";
import type { UserProfile } from "@/types";

const statusVariant: Record<
  string,
  "success" | "warning" | "secondary" | "outline" | "destructive" | "accent"
> = {
  scheduled: "outline",
  upcoming: "accent",
  live: "success",
  live_now: "success",
  completed: "secondary",
  cancelled: "destructive",
  rescheduled: "warning",
  draft: "secondary",
};

interface ClassManagementViewProps {
  basePath: string;
  roleLabel: string;
  lockInstructorId?: string | null;
}

function ClassManagementView({ basePath, roleLabel, lockInstructorId }: ClassManagementViewProps) {
  const [rows, setRows] = React.useState<LiveClassListItem[]>([]);
  const [stats, setStats] = React.useState<{
    today: number;
    upcoming: number;
    liveNow: number;
    completed: number;
    cancelled: number;
    attendanceRate: number;
  } | null>(null);
  const [instructors, setInstructors] = React.useState<UserProfile[]>([]);
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "100" });
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (lockInstructorId) params.set("instructorId", lockInstructorId);

    const [listRes, statsRes, instRes, courseRes] = await Promise.all([
      classFetch<{ data: LiveClassListItem[] }>(`/api/classes?${params}`),
      classFetch<typeof stats>("/api/classes/stats"),
      lockInstructorId
        ? Promise.resolve({ success: true, data: [] as UserProfile[], error: null })
        : classFetch<UserProfile[]>("/api/users?role=instructor"),
      classFetch<{ data: CourseListItem[] }>("/api/courses?pageSize=100"),
    ]);

    setRows(listRes.data?.data ?? []);
    setStats(statsRes.data);
    setInstructors(instRes.data ?? []);
    setCourses(courseRes.data?.data ?? []);
    setLoading(false);
  }, [q, status, lockInstructorId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function runAction(id: string, action: string, extra?: Record<string, unknown>) {
    const result = await classFetch(`/api/classes/${id}/actions`, {
      method: "POST",
      body: JSON.stringify({ action, ...extra }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Action failed");
      return;
    }
    toast.success(`Class ${action}d`);
    void load();
  }

  const columns: DataTableColumn<LiveClassListItem>[] = [
    {
      id: "title",
      header: "Class",
      sortable: true,
      cell: (row) => (
        <div>
          <Link href={`${basePath}/${row.id}`} className="font-medium text-primary hover:underline">
            {row.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.courseCode ?? "No course"} · {row.instructorName ?? "—"}
          </p>
        </div>
      ),
    },
    {
      id: "startsAt",
      header: "Schedule",
      cell: (row) => (
        <div className="text-sm">
          <p>{new Date(row.startsAt).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            {row.durationMinutes} min · {row.timezone}
          </p>
        </div>
      ),
    },
    {
      id: "computedStatus",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant[row.computedStatus] ?? "secondary"}>
          {row.computedStatus === "live_now"
            ? "Live Now"
            : row.computedStatus === "upcoming"
              ? "Upcoming"
              : LIVE_CLASS_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      id: "enrolledCount",
      header: "Students",
      cell: (row) => `${row.enrolledCount}/${row.maxStudents}`,
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Class actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/${row.id}`}>Open</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/join/${row.id}`}>Join / start</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                void runAction(row.id, "reschedule", {
                  startsAt: new Date(Date.parse(row.startsAt) + 86400000).toISOString(),
                })
              }
            >
              Reschedule (+1 day)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void runAction(row.id, "duplicate")}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void runAction(row.id, "cancel")}>
              Cancel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live classes"
        description="Schedule Zoom sessions, monitor status, and manage attendance."
        breadcrumbs={[{ label: roleLabel }, { label: "Classes" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            {basePath.includes("/instructor") ? (
              <Button variant="outline" asChild>
                <Link href="/instructor/calendar">Calendar</Link>
              </Button>
            ) : null}
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Schedule class
            </Button>
          </div>
        }
      />

      <ClassStatsWidgets stats={stats} loading={loading} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions</CardTitle>
          <CardDescription>Filter by status, search titles, and run quick actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <Input
              placeholder="Search classes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="lg:max-w-xs"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live_now">Live now</SelectItem>
                {LIVE_CLASS_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LIVE_CLASS_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<Video className="h-6 w-6" />}
              title="No live classes"
              description="Schedule your first Zoom session for an enrolled cohort."
              actionLabel="Schedule class"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              searchKeys={["title"]}
              emptyMessage="No classes match filters"
            />
          )}
        </CardContent>
      </Card>

      <ClassFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        instructors={
          lockInstructorId
            ? [
                {
                  id: lockInstructorId,
                  email: "you",
                  fullName: "You",
                } as UserProfile,
              ]
            : instructors
        }
        courses={courses}
        defaultInstructorId={lockInstructorId}
        lockInstructor={Boolean(lockInstructorId)}
        onSaved={() => void load()}
      />

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete live class?</AlertDialogTitle>
            <AlertDialogDescription>
              Soft-deletes the session and cancels the linked Zoom meeting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void (async () => {
                  if (!deleteId) return;
                  const result = await classFetch(`/api/classes/${deleteId}`, {
                    method: "DELETE",
                  });
                  if (!result.success) {
                    toast.error(result.error ?? "Delete failed");
                    return;
                  }
                  toast.success("Class deleted");
                  setDeleteId(null);
                  void load();
                })();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { ClassManagementView };
