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

function CalendarWidget({ events = [], className, title = "Calendar" }: CalendarWidgetProps) {
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

  const eventsForDay = (day: Date) => events.filter((e) => isSameDay(parseISODate(e.date), day));

  const upcoming = [...events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((e) => parseISODate(e.date) >= startOfWeek(new Date()))
    .slice(0, 5);

  const displayDays = view === "month" ? days : weekDays;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft",
        className,
      )}
    >
      <div className="relative bg-[#0B1A24] px-4 py-4 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 100% 0%, rgba(46,125,170,0.4), transparent 55%)",
          }}
        />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-base font-semibold tracking-tight">{title}</p>
            <div className="inline-flex rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => setView("month")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  view === "month"
                    ? "bg-accent text-accent-foreground"
                    : "text-white/60 hover:text-white",
                )}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setView("week")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  view === "week"
                    ? "bg-accent text-accent-foreground"
                    : "text-white/60 hover:text-white",
                )}
              >
                Week
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                setCursor((c) => (view === "month" ? subMonths(c, 1) : addDays(c, -7)))
              }
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="font-display text-sm font-semibold">
              {format(cursor, view === "month" ? "MMMM yyyy" : "'Week of' MMM d, yyyy")}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={() => setCursor((c) => (view === "month" ? addMonths(c, 1) : addDays(c, 7)))}
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {displayDays.map((day) => {
            const dayEvents = eventsForDay(day);
            const inMonth = view === "week" || isSameMonth(day, cursor);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-14 rounded-lg p-1 text-left transition-colors",
                  inMonth ? "bg-muted/25" : "opacity-35",
                  today && "bg-primary/10 ring-1 ring-primary/25",
                )}
              >
                <p
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                    today ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </p>
                {dayEvents.slice(0, 2).map((ev) => (
                  <p
                    key={ev.id}
                    className="mt-0.5 truncate border-l-2 border-accent pl-1 text-[10px] text-foreground"
                  >
                    {ev.title}
                  </p>
                ))}
              </div>
            );
          })}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Upcoming
          </p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-muted/30 px-3 py-2.5"
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
      </div>
    </div>
  );
}

function parseISODate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value}T00:00:00`);
}

export { CalendarWidget };
