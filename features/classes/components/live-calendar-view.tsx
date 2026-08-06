"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plane, Video } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { classFetch } from "@/features/classes/lib/api";
import type { CalendarViewEvent, LiveClassListItem } from "@/types/classes";

interface LiveCalendarViewProps {
  roleLabel: string;
  classesHref?: string;
  /** Hide outer page chrome when nested inside another page. */
  embedded?: boolean;
}

const VIEW_OPTIONS = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "agenda", label: "Agenda" },
] as const;

type CalendarViewMode = (typeof VIEW_OPTIONS)[number]["value"];

function LiveCalendarView({ roleLabel, classesHref, embedded = false }: LiveCalendarViewProps) {
  const [events, setEvents] = React.useState<CalendarViewEvent[]>([]);
  const [upcoming, setUpcoming] = React.useState<LiveClassListItem[]>([]);
  const [cursor, setCursor] = React.useState(new Date());
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<CalendarViewMode>("month");

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await classFetch<{
        events?: CalendarViewEvent[];
        upcoming?: LiveClassListItem[];
      }>("/api/classes/calendar?view=agenda");
      if (cancelled) return;
      if (result.success && result.data) {
        setEvents(result.data.events ?? []);
        setUpcoming(result.data.upcoming ?? []);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(cursor));
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function eventsOn(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.startsAt), day));
  }

  function shiftCursor(dir: -1 | 1) {
    if (view === "month") {
      setCursor(dir === 1 ? addMonths(cursor, 1) : subMonths(cursor, 1));
      return;
    }
    if (view === "day") {
      setCursor(addDays(cursor, dir));
      return;
    }
    setCursor(addDays(cursor, dir * 7));
  }

  const chrome = (
    <div className="relative overflow-hidden rounded-2xl bg-[#0B1A24] px-5 py-6 text-white sm:px-7 sm:py-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(46,125,170,0.45), transparent 55%), radial-gradient(ellipse 50% 60% at 0% 100%, rgba(221,155,48,0.18), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
            Flight schedule
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {format(
              cursor,
              view === "day" ? "EEEE, MMM d" : view === "week" ? "'Week of' MMM d" : "MMMM yyyy",
            )}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/65">
            Live sessions on your path — review, join, and stay on course.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setView(opt.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  view === opt.value
                    ? "bg-accent text-accent-foreground shadow-soft"
                    : "text-white/60 hover:text-white",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Previous"
              onClick={() => shiftCursor(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setCursor(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Next"
              onClick={() => shiftCursor(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!embedded ? (
        <PageHeader
          title="Calendar"
          description="Live classes you can access — month, week, day, and agenda."
          breadcrumbs={[{ label: roleLabel }, { label: "Calendar" }]}
          actions={
            classesHref ? (
              <Button variant="accent" asChild>
                <Link href={classesHref}>Manage classes</Link>
              </Button>
            ) : null
          }
        />
      ) : null}

      {chrome}

      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view + format(cursor, "yyyy-MM-dd")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "month" ? (
              <MonthGrid
                days={days}
                cursor={cursor}
                eventsOn={eventsOn}
                onSelectDay={(day) => {
                  setCursor(day);
                  setView("day");
                }}
              />
            ) : null}

            {view === "week" ? <WeekStrip weekDays={weekDays} eventsOn={eventsOn} /> : null}

            {view === "day" ? <DayTimeline day={cursor} events={eventsOn(cursor)} /> : null}

            {view === "agenda" ? <AgendaList upcoming={upcoming} events={events} /> : null}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function MonthGrid({
  days,
  cursor,
  eventsOn,
  onSelectDay,
}: {
  days: Date[];
  cursor: Date;
  eventsOn: (day: Date) => CalendarViewEvent[];
  onSelectDay: (day: Date) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day, i) => {
          const dayEvents = eventsOn(day);
          const outside = !isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "group relative min-h-[5.5rem] border-b border-r border-border/40 p-2 text-left transition-colors hover:bg-primary/[0.04] sm:min-h-24",
                i % 7 === 6 && "border-r-0",
                outside && "bg-muted/20",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  today
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : outside
                      ? "text-muted-foreground/50"
                      : "text-foreground group-hover:bg-muted",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1.5 space-y-1">
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className="truncate rounded-md border-l-2 border-accent bg-primary/8 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                  >
                    <span className="text-muted-foreground">{e.time}</span> {e.title}
                  </div>
                ))}
                {dayEvents.length > 2 ? (
                  <p className="px-1 text-[10px] font-medium text-accent">
                    +{dayEvents.length - 2} more
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekStrip({
  weekDays,
  eventsOn,
}: {
  weekDays: Date[];
  eventsOn: (day: Date) => CalendarViewEvent[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-7">
      {weekDays.map((day, i) => {
        const dayEvents = eventsOn(day);
        const today = isToday(day);
        return (
          <motion.div
            key={day.toISOString()}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className={cn(
              "min-h-40 rounded-2xl border border-border/60 bg-card p-3",
              today && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
            )}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {format(day, "EEE")}
              </p>
              <span
                className={cn(
                  "font-display text-lg font-semibold",
                  today ? "text-primary" : "text-foreground",
                )}
              >
                {format(day, "d")}
              </span>
            </div>
            <div className="space-y-2">
              {dayEvents.length === 0 ? (
                <p className="pt-6 text-center text-xs text-muted-foreground/70">Clear skies</p>
              ) : (
                dayEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/join/${e.liveClassId}`}
                    className="block rounded-xl border-l-2 border-accent bg-muted/40 px-2.5 py-2 transition hover:bg-primary/10"
                  >
                    <p className="truncate text-xs font-semibold">{e.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{e.time}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DayTimeline({ day, events }: { day: Date; events: CalendarViewEvent[] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Plane className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-display text-lg font-semibold">{format(day, "EEEE, MMMM d")}</p>
          <p className="text-sm text-muted-foreground">
            {events.length === 0
              ? "No sessions scheduled"
              : `${events.length} session${events.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
      {events.length === 0 ? (
        <EmptySchedule />
      ) : (
        <ul className="relative space-y-0 border-l border-border/70 pl-6">
          {events.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="relative pb-6 last:pb-0"
            >
              <span className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-card" />
              <div className="flex flex-col gap-3 rounded-xl bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {e.time} · {e.status}
                  </p>
                </div>
                <Button asChild size="sm" variant="accent">
                  <Link href={`/join/${e.liveClassId}`}>Join session</Link>
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgendaList({
  upcoming,
  events,
}: {
  upcoming: LiveClassListItem[];
  events: CalendarViewEvent[];
}) {
  const items = upcoming.length ? upcoming : events;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-16">
        <EmptySchedule />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isList = "computedStatus" in item;
        const id = isList ? item.id : item.liveClassId;
        const title = item.title;
        const startsAt = item.startsAt;
        const status = isList ? item.computedStatus : item.status;
        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1A24] text-accent">
                <Video className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(startsAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Badge variant="outline">{String(status)}</Badge>
              <Button asChild size="sm" variant="accent">
                <Link href={`/join/${id}`}>Join</Link>
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptySchedule() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Plane className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="font-display text-lg font-semibold">No upcoming classes</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        When sessions are scheduled for you, they appear here — clear skies for now.
      </p>
    </div>
  );
}

export { LiveCalendarView };
