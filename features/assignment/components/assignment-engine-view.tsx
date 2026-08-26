"use client";

import * as React from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Hourglass, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Snapshot = {
  counts: {
    instructors: number;
    requests: number;
    schedulingRequired: number;
    queued: number;
    scheduled: number;
    unable: number;
    waitingQueue: number;
  };
  instructors: Array<{
    id: string;
    name: string;
    email: string;
    windows: number;
    openRequests: number;
  }>;
  atplCourses: Array<{
    id: string;
    code: string;
    title: string;
    primaryInstructorId: string | null;
  }>;
  recentRequests: Array<{
    id: string;
    kind: string;
    lessonTitle: string;
    status: string;
    instructorId: string;
    conflictSummary: string | null;
    unableReason: string | null;
    liveClassId: string | null;
    zoomMeetingId: string | null;
    queuePosition: number | null;
  }>;
  queue: Array<{
    id: string;
    assignmentRequestId: string;
    instructorId: string;
    status: string;
    preferredStartsAt: string | null;
  }>;
};

type CalendarPayload = {
  instructorName: string;
  events: Array<{
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    type: string;
    status: string;
  }>;
  availability: Array<{ weekday: number; startTime: string; endTime: string }>;
  queue: Array<{ id: string; status: string }>;
};

async function assignFetch<T>(query = ""): Promise<T> {
  const res = await fetch(`/api/assignment${query}`, { cache: "no-store" });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function assignPost(body: Record<string, unknown>) {
  const res = await fetch("/api/assignment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: unknown; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AssignmentEngineView({ initial }: { initial: Snapshot }) {
  const [data, setData] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [courseId, setCourseId] = React.useState(initial.atplCourses[0]?.id ?? "");
  const [instructorId, setInstructorId] = React.useState(initial.instructors[0]?.id ?? "");
  const [calendarInstructorId, setCalendarInstructorId] = React.useState(
    initial.instructors[0]?.id ?? "",
  );
  const [calendar, setCalendar] = React.useState<CalendarPayload | null>(null);
  const [preferredStartsAt, setPreferredStartsAt] = React.useState("");

  async function refresh() {
    setData(await assignFetch<Snapshot>("?view=dashboard"));
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    if (!calendarInstructorId) return;
    void assignFetch<CalendarPayload>(`?view=calendar&instructorId=${calendarInstructorId}`)
      .then(setCalendar)
      .catch((err: Error) => setError(err.message));
  }, [calendarInstructorId, data.counts.requests, data.counts.queued]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Instructor Assignment Engine"
        description="ATPL assign / reassign, availability, conflicts, automatic Zoom, and waiting queue."
        breadcrumbs={[{ label: "CGI" }, { label: "Assignment Engine" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Scheduling required"
          value={data.counts.schedulingRequired}
          icon={Hourglass}
        />
        <StatCard label="Waiting queue" value={data.counts.waitingQueue} icon={Users} />
        <StatCard label="Scheduled" value={data.counts.scheduled} icon={CheckCircle2} />
        <StatCard label="Unable to schedule" value={data.counts.unable} icon={AlertTriangle} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Assign / reassign instructor</h2>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>ATPL subject</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {data.atplCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Instructor</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                {data.instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Preferred start (optional)</Label>
            <Input
              type="datetime-local"
              value={preferredStartsAt}
              onChange={(e) => setPreferredStartsAt(e.target.value)}
            />
          </div>
          <Button
            disabled={busy || !courseId || !instructorId}
            onClick={() =>
              void run(() =>
                assignPost({
                  action: "assign",
                  courseId,
                  instructorId,
                  preferredStartsAt: preferredStartsAt
                    ? new Date(preferredStartsAt).toISOString()
                    : null,
                  scheduleNow: Boolean(preferredStartsAt),
                  autoZoom: true,
                }),
              )
            }
          >
            Assign
          </Button>
          <Button
            variant="secondary"
            disabled={busy || !courseId || !instructorId}
            onClick={() =>
              void run(() =>
                assignPost({
                  action: "reassign",
                  courseId,
                  instructorId,
                  moveFutureClasses: true,
                }),
              )
            }
          >
            Reassign
          </Button>
          <Button
            variant="outline"
            disabled={busy || !courseId || !instructorId}
            onClick={() =>
              void run(() =>
                assignPost({
                  action: "schedule",
                  courseId,
                  instructorId,
                  lessonTitle: "ATPL coaching session",
                  startsAt: preferredStartsAt
                    ? new Date(preferredStartsAt).toISOString()
                    : undefined,
                  autoZoom: true,
                }),
              )
            }
          >
            Schedule + Zoom
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Waiting queue</h2>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void run(() => assignPost({ action: "process_queue" }))}
          >
            Process queue
          </Button>
        </div>
        <ul className="space-y-2 text-sm">
          {data.queue.length === 0 ? (
            <li className="text-muted-foreground">Queue is empty.</li>
          ) : (
            data.queue.map((q) => (
              <li key={q.id} className="border-b border-border/60 pb-2">
                Request {q.assignmentRequestId.slice(0, 8)} · {q.status}
                {q.preferredStartsAt
                  ? ` · preferred ${new Date(q.preferredStartsAt).toLocaleString()}`
                  : ""}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent assignment requests</h2>
        <ul className="space-y-2 text-sm">
          {data.recentRequests.length === 0 ? (
            <li className="text-muted-foreground">No requests yet.</li>
          ) : (
            data.recentRequests.map((r) => (
              <li key={r.id} className="border-b border-border/60 pb-2">
                <span className="font-medium">{r.lessonTitle}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {r.kind} · <span className="text-foreground">{r.status}</span>
                  {r.queuePosition ? ` · queue #${r.queuePosition}` : ""}
                  {r.zoomMeetingId ? ` · Zoom ${r.zoomMeetingId}` : ""}
                </span>
                {r.conflictSummary ? (
                  <div className="text-amber-700 dark:text-amber-400">
                    Conflict: {r.conflictSummary}
                  </div>
                ) : null}
                {r.unableReason ? (
                  <div className="text-destructive">Unable: {r.unableReason}</div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Instructor calendar</h2>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Instructor</Label>
            <Select value={calendarInstructorId} onValueChange={setCalendarInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                {data.instructors.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !calendarInstructorId}
            onClick={() =>
              void run(() =>
                assignPost({
                  action: "set_availability",
                  instructorId: calendarInstructorId,
                  windows: [1, 2, 3, 4, 5].map((weekday) => ({
                    weekday,
                    startTime: "09:00",
                    endTime: "17:00",
                    timezone: "UTC",
                  })),
                }),
              )
            }
          >
            Set Mon–Fri 09–17 availability
          </Button>
        </div>
        {calendar ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <CalendarClock className="mr-1 inline h-4 w-4" />
              {calendar.instructorName} · {calendar.availability.length} weekly windows ·{" "}
              {calendar.queue.length} queued
            </p>
            <ul className="space-y-2 text-sm">
              {calendar.availability.map((w, idx) => (
                <li key={`${w.weekday}-${idx}`} className="text-muted-foreground">
                  {WEEKDAYS[w.weekday]} {w.startTime}–{w.endTime}
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm">
              {calendar.events.length === 0 ? (
                <li className="text-muted-foreground">No calendar events in range.</li>
              ) : (
                calendar.events.slice(0, 24).map((e) => (
                  <li key={e.id} className="border-b border-border/60 pb-2">
                    <span className="font-medium">{e.title}</span>
                    <div className="text-muted-foreground">
                      {e.type} · {e.status} · {new Date(e.startsAt).toLocaleString()}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
