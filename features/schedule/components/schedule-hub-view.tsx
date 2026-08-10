"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/app-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScheduleOverview, ScheduleSession, TimelineEvent } from "@/types/schedule";

type HubRole = "student" | "instructor" | "cgi" | "admin";

async function apiGet<T>(query: string): Promise<T> {
  const res = await fetch(`/api/schedule${query}`, { cache: "no-store" });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function apiPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/schedule", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

function statusTone(status: string) {
  if (status === "live_now" || status === "live") return "default";
  if (status === "cancelled") return "destructive";
  if (status === "completed") return "secondary";
  return "outline";
}

export function ScheduleHubView({
  role,
  breadcrumbs,
  calendarHref,
}: {
  role: HubRole;
  breadcrumbs: Array<{ label: string; href?: string }>;
  calendarHref?: string;
}) {
  const canManage = role !== "student";
  const [overview, setOverview] = React.useState<ScheduleOverview | null>(null);
  const [source, setSource] = React.useState<"all" | "live_course" | "atpl">("all");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [startsAt, setStartsAt] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState("60");
  const [frequency, setFrequency] = React.useState<"once" | "weekly" | "daily">("once");
  const [count, setCount] = React.useState("4");
  const [instructorId, setInstructorId] = React.useState("");

  const load = React.useCallback(async () => {
    const q = source === "all" ? "?view=overview" : `?view=overview&source=${source}`;
    const data = await apiGet<ScheduleOverview>(q);
    setOverview(data);
  }, [source]);

  React.useEffect(() => {
    void load().catch((err: Error) => setError(err.message));
  }, [load]);

  async function onBuild(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        action: "build",
        title,
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes: Number(durationMinutes) || 60,
      };
      if (instructorId) body.instructorId = instructorId;
      if (frequency !== "once") {
        body.recurrence = {
          frequency,
          interval: 1,
          count: Number(count) || 4,
        };
      }
      await apiPost(body);
      toast.success("Session scheduled");
      setTitle("");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to schedule";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function runAction(
    session: ScheduleSession,
    action: string,
    extra: Record<string, unknown> = {},
  ) {
    setBusy(true);
    setError(null);
    try {
      await apiPost({ action, liveClassId: session.id, ...extra });
      toast.success("Updated");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const next = overview?.nextSession.session ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Schedule"
        description="Dynamic schedule for Live Courses and ATPL — builder, next session, reminders, attendance, and timeline."
        breadcrumbs={breadcrumbs}
        actions={
          calendarHref ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={calendarHref}>Open calendar</Link>
            </Button>
          ) : null
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-muted-foreground">Source</Label>
        <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            <SelectItem value="live_course">Live courses</SelectItem>
            <SelectItem value="atpl">ATPL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-3 border-b border-border/50 pb-8"
      >
        <h2 className="font-heading text-xl tracking-tight">Next session</h2>
        {next ? (
          <div className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight">{next.title}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(next.startsAt).toLocaleString()} ·{" "}
              {overview?.nextSession.startsInMinutes != null
                ? `in ${overview.nextSession.startsInMinutes} min`
                : "upcoming"}{" "}
              · {next.source === "atpl" ? "ATPL" : "Live course"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusTone(next.computedStatus)}>{next.computedStatus}</Badge>
              {next.isRecurring ? <Badge variant="outline">Recurring</Badge> : null}
              <span className="text-xs text-muted-foreground">
                Student reminders pending: {overview?.nextSession.pendingStudentReminders ?? 0} ·
                Instructor: {overview?.nextSession.pendingInstructorReminders ?? 0}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming session.</p>
        )}
        {overview ? (
          <p className="text-sm text-muted-foreground">
            Upcoming {overview.stats.upcoming} · Live now {overview.stats.liveNow} · Completed{" "}
            {overview.stats.completed} · Cancelled {overview.stats.cancelled} · Series{" "}
            {overview.stats.recurringSeries}
          </p>
        ) : null}
      </motion.section>

      {canManage ? (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="space-y-4 border-b border-border/50 pb-8"
        >
          <div>
            <h2 className="font-heading text-xl tracking-tight">Schedule builder</h2>
            <p className="text-sm text-muted-foreground">
              Create a one-off or recurring class. ATPL subjects auto-link a lecture assignment.
            </p>
          </div>
          <form onSubmit={(e) => void onBuild(e)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Met briefing · Weekly ops"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts">Starts</Label>
              <Input
                id="starts"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {frequency !== "once" ? (
              <div className="space-y-2">
                <Label htmlFor="count">Occurrences</Label>
                <Input
                  id="count"
                  type="number"
                  min={2}
                  max={52}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </div>
            ) : null}
            {(role === "cgi" || role === "admin") && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instructor">Instructor user id</Label>
                <Input
                  id="instructor"
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  placeholder="Required for CGI / admin"
                  required
                />
              </div>
            )}
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy}>
                Schedule session
              </Button>
            </div>
          </form>
        </motion.section>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4 border-b border-border/50 pb-8"
      >
        <h2 className="font-heading text-xl tracking-tight">Upcoming &amp; manage</h2>
        <ul className="space-y-4">
          {(overview?.upcoming ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No upcoming sessions.</li>
          ) : (
            overview!.upcoming.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.startsAt).toLocaleString()} ·{" "}
                    {session.instructorName ?? "Instructor"} ·{" "}
                    {session.source === "atpl" ? "ATPL" : "Live"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusTone(session.computedStatus)}>
                      {session.computedStatus}
                    </Badge>
                    {session.isRecurring ? <Badge variant="outline">Series</Badge> : null}
                    <span className="text-xs text-muted-foreground">
                      Attendance {session.attendance.present + session.attendance.late}/
                      {session.attendance.total || session.enrolledCount}
                    </span>
                  </div>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy || session.status === "cancelled"}
                      onClick={() =>
                        void runAction(session, "reschedule", {
                          startsAt: new Date(
                            Date.parse(session.startsAt) + 86_400_000,
                          ).toISOString(),
                        })
                      }
                    >
                      Reschedule +1d
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void runAction(session, "remind_students")}
                    >
                      Student reminder
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void runAction(session, "remind_instructors")}
                    >
                      Instructor reminder
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy || session.status === "cancelled"}
                      onClick={() =>
                        void runAction(session, "cancel", {
                          reason: "Cancelled from schedule hub",
                          series: false,
                        })
                      }
                    >
                      Cancel
                    </Button>
                    {session.isRecurring ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() =>
                          void runAction(session, "cancel", {
                            reason: "Series cancelled",
                            series: true,
                          })
                        }
                      >
                        Cancel series
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="space-y-4"
      >
        <div>
          <h2 className="font-heading text-xl tracking-tight">Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Chronological class status, reminders, attendance, and ATPL lecture assignments.
          </p>
        </div>
        <ol className="relative space-y-4 border-l border-border/70 pl-5">
          {(overview?.timeline ?? []).map((event: TimelineEvent) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary/80" />
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.at).toLocaleString()} · {event.kind.replaceAll("_", " ")}
                {event.status ? ` · ${event.status}` : ""}
              </p>
              <p className="text-sm text-muted-foreground">{event.detail}</p>
            </li>
          ))}
          {(overview?.timeline ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">Timeline is empty.</li>
          ) : null}
        </ol>
      </motion.section>
    </div>
  );
}
