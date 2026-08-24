"use client";

import * as React from "react";
import Link from "next/link";
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
import { ChevronLeft, ChevronRight, Video } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { classFetch } from "@/features/classes/lib/api";
import type { CalendarViewEvent, LiveClassListItem } from "@/types/classes";

interface LiveCalendarViewProps {
  roleLabel: string;
  classesHref?: string;
}

function LiveCalendarView({ roleLabel, classesHref }: LiveCalendarViewProps) {
  const [events, setEvents] = React.useState<CalendarViewEvent[]>([]);
  const [upcoming, setUpcoming] = React.useState<LiveClassListItem[]>([]);
  const [cursor, setCursor] = React.useState(new Date());
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<"month" | "week" | "day" | "agenda">("month");

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Live classes you can access — month, week, day, and agenda."
        breadcrumbs={[{ label: roleLabel }, { label: "Calendar" }]}
        actions={
          classesHref ? (
            <Button variant="outline" asChild>
              <Link href={classesHref}>Manage classes</Link>
            </Button>
          ) : null
        }
      />

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous"
              onClick={() =>
                setCursor(view === "month" ? subMonths(cursor, 1) : addDays(cursor, -7))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-40 text-center text-sm font-medium">
              {format(cursor, view === "day" ? "MMM d, yyyy" : "MMMM yyyy")}
            </p>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next"
              onClick={() =>
                setCursor(view === "month" ? addMonths(cursor, 1) : addDays(cursor, 7))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="mt-4 h-80 w-full" />
        ) : (
          <>
            <TabsContent value="month" className="mt-4">
              <Card>
                <CardContent className="p-3">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-2 font-medium">
                        {d}
                      </div>
                    ))}
                    {days.map((day) => {
                      const dayEvents = eventsOn(day);
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          onClick={() => {
                            setCursor(day);
                            setView("day");
                          }}
                          className={cn(
                            "min-h-20 rounded-lg border border-transparent p-1 text-left transition hover:border-border",
                            !isSameMonth(day, cursor) && "opacity-40",
                            isToday(day) && "bg-accent/20",
                          )}
                        >
                          <span className="text-xs font-medium">{format(day, "d")}</span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 2).map((e) => (
                              <div
                                key={e.id}
                                className="truncate rounded bg-primary/10 px-1 text-[10px] text-primary"
                              >
                                {e.time} {e.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 ? (
                              <p className="text-[10px] text-muted-foreground">
                                +{dayEvents.length - 2} more
                              </p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-4">
              <div className="grid gap-3 md:grid-cols-7">
                {weekDays.map((day) => (
                  <Card key={day.toISOString()}>
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">{format(day, "EEE d")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-0">
                      {eventsOn(day).length === 0 ? (
                        <p className="text-xs text-muted-foreground">—</p>
                      ) : (
                        eventsOn(day).map((e) => (
                          <Link
                            key={e.id}
                            href={`/join/${e.liveClassId}`}
                            className="block rounded-lg border border-border/70 p-2 text-xs hover:bg-muted/40"
                          >
                            <p className="font-medium">{e.title}</p>
                            <p className="text-muted-foreground">{e.time}</p>
                          </Link>
                        ))
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="day" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{format(cursor, "EEEE, MMM d")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {eventsOn(cursor).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No classes this day.</p>
                  ) : (
                    eventsOn(cursor).map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-3"
                      >
                        <div>
                          <p className="font-medium">{e.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.time} · {e.status}
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/join/${e.liveClassId}`}>Join</Link>
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda" className="mt-4 space-y-3">
              {upcoming.length === 0 && events.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <Video className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">No upcoming classes</p>
                    <p className="text-sm text-muted-foreground">
                      When sessions are scheduled for you, they appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                (upcoming.length ? upcoming : events).map((item) => {
                  const isList = "computedStatus" in item;
                  const id = isList ? item.id : item.liveClassId;
                  const title = item.title;
                  const startsAt = isList ? item.startsAt : item.startsAt;
                  const status = isList ? item.computedStatus : item.status;
                  return (
                    <Card key={id}>
                      <CardContent className="flex items-center justify-between gap-3 py-4">
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(startsAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{String(status)}</Badge>
                          <Button asChild size="sm">
                            <Link href={`/join/${id}`}>Join</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export { LiveCalendarView };
