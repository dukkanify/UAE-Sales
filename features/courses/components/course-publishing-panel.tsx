"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COURSE_DELIVERY_LABELS,
  COURSE_DELIVERY_TYPES,
  COURSE_STATUS_LABELS,
  COURSE_STATUSES,
  PUBLIC_COURSE_DELIVERY_FILTER_LABELS,
  PUBLIC_COURSE_DELIVERY_FILTERS,
} from "@/constants/courses";
import { courseFetch } from "@/features/courses/lib/api";
import type { CourseListItem, CourseStatus, PublicCourseDeliveryFilter } from "@/types/courses";
import type { PlatformSettings } from "@/types/settings";

type CourseDraft = {
  status: CourseStatus;
  deliveryType: "recorded" | "live";
  enrollmentOpen: boolean;
  hidden: boolean;
  scheduledPublishAt: string;
};

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CoursePublishingPanel() {
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, CourseDraft>>({});
  const [deliveryFilter, setDeliveryFilter] = React.useState<PublicCourseDeliveryFilter>("all");
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [savingFilter, setSavingFilter] = React.useState(false);
  const [q, setQ] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "100", sortBy: "title", sortDir: "asc" });
    if (q.trim()) params.set("q", q.trim());

    const [listRes, settingsRes] = await Promise.all([
      courseFetch<{ data: CourseListItem[] }>(`/api/courses?${params}`),
      courseFetch<{ settings: PlatformSettings }>("/api/admin/settings"),
    ]);

    const rows = listRes.data?.data ?? [];
    setCourses(rows);
    setDrafts(
      Object.fromEntries(
        rows.map((c) => [
          c.id,
          {
            status: c.status,
            deliveryType: c.deliveryType ?? "recorded",
            enrollmentOpen: c.enrollmentOpen ?? true,
            hidden: Boolean(c.hidden),
            scheduledPublishAt: toLocalInput(c.scheduledPublishAt),
          },
        ]),
      ),
    );
    const filter = settingsRes.data?.settings?.courses?.publicDeliveryFilter;
    if (filter === "recorded" || filter === "live" || filter === "all") {
      setDeliveryFilter(filter);
    }
    setLoading(false);
  }, [q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  function patchDraft(id: string, patch: Partial<CourseDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, ...patch },
    }));
  }

  async function saveCourse(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    const result = await courseFetch<CourseListItem>(`/api/courses/${id}/publishing`, {
      method: "PATCH",
      body: JSON.stringify({
        status: draft.status,
        deliveryType: draft.deliveryType,
        enrollmentOpen: draft.enrollmentOpen,
        hidden: draft.hidden,
        scheduledPublishAt:
          draft.status === "scheduled" && draft.scheduledPublishAt
            ? new Date(draft.scheduledPublishAt).toISOString()
            : null,
      }),
    });
    setSavingId(null);
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Unable to update publishing");
      return;
    }
    toast.success(`Updated ${result.data.code}`);
    void load();
  }

  async function saveDeliveryFilter(next: PublicCourseDeliveryFilter) {
    setDeliveryFilter(next);
    setSavingFilter(true);
    const result = await courseFetch<{ settings: PlatformSettings }>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ patch: { courses: { publicDeliveryFilter: next } } }),
    });
    setSavingFilter(false);
    if (!result.success) {
      toast.error(result.error ?? "Unable to save catalog filter");
      void load();
      return;
    }
    toast.success("Public catalog delivery filter saved");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course publishing"
        description="Control draft/published status, recorded vs live visibility, enrollment, hide, and scheduled publish. Super Admin only."
        breadcrumbs={[
          { label: "Super Admin" },
          { label: "Courses", href: "/super-admin/courses" },
          { label: "Publishing" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/super-admin/courses">Back to courses</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public catalog delivery</CardTitle>
          <CardDescription>
            Show only one delivery type on public surfaces, or both. Hidden and non-published
            courses never appear regardless of this filter.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-md space-y-2">
          <Label>Public delivery filter</Label>
          <Select
            value={deliveryFilter}
            onValueChange={(v) => void saveDeliveryFilter(v as PublicCourseDeliveryFilter)}
            disabled={savingFilter || loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PUBLIC_COURSE_DELIVERY_FILTERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {PUBLIC_COURSE_DELIVERY_FILTER_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="pub-q">Search courses</Label>
          <Input
            id="pub-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title or code"
            className="w-64"
          />
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No courses found.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const draft = drafts[course.id];
            if (!draft) return null;
            return (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        <Link
                          href={`/super-admin/courses/${course.id}`}
                          className="hover:underline"
                        >
                          {course.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {course.code}
                        {course.primaryInstructorName
                          ? ` · ${course.primaryInstructorName}`
                          : " · Unassigned"}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{COURSE_STATUS_LABELS[course.status]}</Badge>
                      <Badge variant="secondary">
                        {COURSE_DELIVERY_LABELS[course.deliveryType ?? "recorded"]}
                      </Badge>
                      {course.hidden ? <Badge variant="destructive">Hidden</Badge> : null}
                      {!course.enrollmentOpen ? (
                        <Badge variant="warning">Enrollment closed</Badge>
                      ) : (
                        <Badge variant="success">Enrollment open</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={draft.status}
                      onValueChange={(v) => patchDraft(course.id, { status: v as CourseStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {COURSE_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery type</Label>
                    <Select
                      value={draft.deliveryType}
                      onValueChange={(v) =>
                        patchDraft(course.id, { deliveryType: v as "recorded" | "live" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSE_DELIVERY_TYPES.map((d) => (
                          <SelectItem key={d} value={d}>
                            {COURSE_DELIVERY_LABELS[d]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {draft.status === "scheduled" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`sched-${course.id}`}>Scheduled publish</Label>
                      <Input
                        id={`sched-${course.id}`}
                        type="datetime-local"
                        value={draft.scheduledPublishAt}
                        onChange={(e) =>
                          patchDraft(course.id, { scheduledPublishAt: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Schedule</Label>
                      <p className="text-sm text-muted-foreground pt-2">
                        Set status to Scheduled to pick a publish time.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">Enrollment open</p>
                      <p className="text-xs text-muted-foreground">Allow new student enrollments</p>
                    </div>
                    <Switch
                      checked={draft.enrollmentOpen}
                      onCheckedChange={(v: boolean) => patchDraft(course.id, { enrollmentOpen: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">Hide course</p>
                      <p className="text-xs text-muted-foreground">
                        Remove from all public surfaces
                      </p>
                    </div>
                    <Switch
                      checked={draft.hidden}
                      onCheckedChange={(v: boolean) => patchDraft(course.id, { hidden: v })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => void saveCourse(course.id)}
                      loading={savingId === course.id}
                      className="w-full sm:w-auto"
                    >
                      Save publishing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { CoursePublishingPanel };
