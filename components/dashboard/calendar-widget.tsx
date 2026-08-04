"use client";

import * as React from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date
  time?: string;
  type?: string;
}

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  className?: string;
  title?: string;
}

function CalendarWidget({
  events = [],
  className,
  title = "Calendar",
}: CalendarWidgetProps) {
  const [view, setView] = React.useState<"month" | "week">("month");
  const [cursor, setCursor] = React.useState(new Date());

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(d);
  }

  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const eventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISODate(e.date), day));

  const upcoming = [...events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((e) => parseISODate(e.date) >= startOfWeek(new Date()))
    .slice(0, 5);

  const displayDays = view === "month" ? days : weekDays;

  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCursor((c) => (view === "month" ? subMonths(c, 1) : addDays(c, -7)))}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="font-display text-sm font-semibold">
            {format(cursor, view === "month" ? "MMMM yyyy" : "'Week of' MMM d, yyyy")}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCursor((c) => (view === "month" ? addMonths(c, 1) : addDays(c, 7)))}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {displayDays.map((day) => {
            const dayEvents = eventsForDay(day);
            const inMonth = view === "week" || isSameMonth(day, cursor);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-14 rounded-md border border-transparent p-1 text-left",
                  inMonth ? "bg-muted/30" : "opacity-40",
                  isToday(day) && "border-accent bg-accent/10",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-medium",
                    isToday(day) ? "text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </p>
                {dayEvents.slice(0, 2).map((ev) => (
                  <p key={ev.id} className="mt-0.5 truncate text-[10px] text-foreground">
                    {ev.title}
                  </p>
                ))}
              </div>
            );
          })}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Upcoming</p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISODate(ev.date), "MMM d")}
                      {ev.time ? ` · ${ev.time}` : ""}
                    </p>
                  </div>
                  {ev.type ? <Badge variant="outline">{ev.type}</Badge> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function parseISODate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value}T00:00:00`);
}

export { CalendarWidget };
