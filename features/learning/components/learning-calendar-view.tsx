"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, List } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { LiveCalendarView } from "@/features/classes/components/live-calendar-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { learningFetch } from "@/features/learning/lib/api";
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
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === "calendar" ? "default" : "outline"}
              onClick={() => setView("calendar")}
            >
              <CalendarDays className="size-4" />
              Calendar
            </Button>
            <Button
              size="sm"
              variant={view === "agenda" ? "default" : "outline"}
              onClick={() => setView("agenda")}
            >
              <List className="size-4" />
              Agenda
            </Button>
          </div>
        }
      />

      {view === "calendar" ? (
        <LiveCalendarView roleLabel="Student" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agenda.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.startsAt).toLocaleString()}
                    {item.endsAt ? ` → ${new Date(item.endsAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.type.replace(/_/g, " ")}</Badge>
                  <Badge variant="outline">{item.status}</Badge>
                  {item.href ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link href={item.href}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {!agenda.length ? (
              <p className="text-sm text-muted-foreground">No calendar items yet.</p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { LearningCalendarPageView };
