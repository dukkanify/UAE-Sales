"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, List, Target } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { LiveCalendarView } from "@/features/classes/components/live-calendar-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { learningFetch } from "@/features/learning/lib/api";
import { cn } from "@/lib/utils";
import type { LearningCalendarItem } from "@/types/learning";

function LearningCalendarPageView() {
  const [view, setView] = React.useState<"calendar" | "agenda">("calendar");
  const [agenda, setAgenda] = React.useState<LearningCalendarItem[]>([]);

  React.useEffect(() => {
    void (async () => {
      const result = await learningFetch<LearningCalendarItem[]>("/api/learning/calendar");
      setAgenda(result.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning calendar"
        description="Live classes, study plan, deadlines, and upcoming lessons."
        breadcrumbs={[{ label: "Student" }, { label: "Calendar" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="accent" size="sm" asChild>
              <Link href="/student/bookings">Book a session</Link>
            </Button>
            <div className="inline-flex rounded-xl border border-border/70 bg-card p-1 shadow-soft">
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "calendar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CalendarDays className="size-3.5" />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setView("agenda")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "agenda"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="size-3.5" />
                Study agenda
              </button>
            </div>
          </div>
        }
      />

      {view === "calendar" ? (
        <LiveCalendarView roleLabel="Student" embedded />
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl bg-[#0B1A24] px-5 py-6 text-white sm:px-7">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 90% 10%, rgba(46,125,170,0.4), transparent 55%), radial-gradient(ellipse 40% 50% at 10% 90%, rgba(221,155,48,0.2), transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                Study path
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Your learning agenda
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/65">
                Classes, deadlines, and study milestones in one timeline.
              </p>
            </div>
          </div>

          {!agenda.length ? (
            <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center">
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <p className="font-display text-lg font-semibold">No agenda items yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your study plan and deadlines will show up here.
              </p>
            </div>
          ) : (
            agenda.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(item.startsAt).toLocaleString()}
                      {item.endsAt ? ` → ${new Date(item.endsAt).toLocaleString()}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  <Badge variant="secondary">{item.type.replace(/_/g, " ")}</Badge>
                  <Badge variant="outline">{item.status}</Badge>
                  {item.href ? (
                    <Button asChild size="sm" variant="accent">
                      <Link href={item.href}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export { LearningCalendarPageView };
