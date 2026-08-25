"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  FolderOpen,
  PlayCircle,
  Search,
  UserRound,
  Video,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard, ProgressWidget, QuickActions, RecentActivity } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { learningFetch } from "@/features/learning/lib/api";
import { safePath } from "@/lib/links/safe-href";
import type { LearningDashboardOverview, LearningHistoryEvent } from "@/types/learning";

function LearningDashboardView() {
  const [overview, setOverview] = React.useState<LearningDashboardOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await learningFetch<LearningDashboardOverview>("/api/learning/dashboard");
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Unable to load dashboard");
        setOverview(null);
      } else {
        setOverview(result.data);
        setError(null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resumeHref = overview?.resume
    ? safePath(
        ["student", "courses", overview.resume.courseId, "lessons", overview.resume.lessonId],
        "/student/courses",
      )
    : "/student/courses";

  const activity = (overview?.recentActivity ?? []).map((e: LearningHistoryEvent) => ({
    id: e.id,
    title: e.title,
    timestamp: e.createdAt,
    description: e.description || e.type.replace(/_/g, " "),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student dashboard"
        description="Resume lessons, track subject progress, and prepare for live sessions."
        breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground">
              Refresh the page, or open your courses to continue studying.
            </p>
            <Button asChild variant="outline">
              <Link href="/student/courses">Go to courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : overview ? (
        <>
          {overview.resume ? (
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardDescription>Continue where you left off</CardDescription>
                  <CardTitle className="font-display text-2xl tracking-tight">
                    {overview.resume.lessonTitle}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {overview.resume.courseTitle}
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href={resumeHref}>
                    <PlayCircle className="size-4" />
                    Resume lesson
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active courses" value={overview.activeCourses} icon={BookOpen} />
            <StatCard
              label="Course progress"
              value={`${Math.round(overview.progressPercent)}%`}
              icon={PlayCircle}
            />
            <StatCard label="Learning hours" value={`${overview.learningHours}h`} icon={Clock3} />
            <StatCard
              label="Next live class"
              value={overview.upcomingLiveClass ? "Scheduled" : "None"}
              hint={overview.upcomingLiveClass ?? "No sessions on the calendar yet"}
              icon={Video}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProgressWidget
              title="Overall progress"
              value={Math.round(overview.progressPercent)}
              label="Across enrolled courses"
            />
            <ProgressWidget
              title="Weekly study goal"
              value={overview.weeklyGoalPercent}
              label="Hours vs target"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <RecentActivity items={activity} title="Recent activity" />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next live class</CardTitle>
                <CardDescription>
                  {overview.upcomingLiveClass ??
                    "Nothing scheduled yet — check the calendar for upcoming sessions."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href="/student/calendar">
                    <CalendarDays className="size-4" />
                    Open calendar
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/student/profile">
                    <UserRound className="size-4" />
                    My account
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <QuickActions
            actions={[
              { label: "Continue learning", href: resumeHref, icon: PlayCircle },
              { label: "Live classes", href: "/student/calendar", icon: Video },
              { label: "Study resources", href: "/student/resources", icon: FolderOpen },
              { label: "Search academy", href: "/student/search", icon: Search },
            ]}
          />
        </>
      ) : null}
    </div>
  );
}

export { LearningDashboardView };
