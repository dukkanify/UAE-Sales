"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  CalendarDays,
  Clock3,
  FolderOpen,
  PlayCircle,
  Search,
  Star,
  Video,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  StatCard,
  ProgressWidget,
  QuickActions,
  RecentActivity,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { learningFetch } from "@/features/learning/lib/api";
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
    ? `/student/courses/${overview.resume.courseId}/lessons/${overview.resume.lessonId}`
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
        title="Learning journey"
        description="Resume lessons, track progress, and stay ahead of live classes."
        breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : overview ? (
        <>
          {overview.resume ? (
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardDescription>Continue learning</CardDescription>
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
                    Resume last lesson
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active courses" value={overview.activeCourses} icon={BookOpen} />
            <StatCard
              label="Completed courses"
              value={overview.completedCourses}
              icon={Star}
            />
            <StatCard
              label="Upcoming live class"
              value={overview.upcomingLiveClass ? "Scheduled" : "None"}
              hint={overview.upcomingLiveClass ?? "No upcoming sessions"}
              icon={Video}
            />
            <StatCard
              label="Learning hours"
              value={`${overview.learningHours}h`}
              icon={Clock3}
            />
            <StatCard
              label="Progress"
              value={`${Math.round(overview.progressPercent)}%`}
              icon={PlayCircle}
            />
            <StatCard label="Assignments" value={overview.assignments} icon={FolderOpen} />
            <StatCard
              label="Notifications"
              value={overview.notifications}
              icon={Bookmark}
            />
            <StatCard
              label="Weekly goal"
              value={`${overview.weeklyGoalPercent}%`}
              icon={CalendarDays}
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
                  {overview.upcomingLiveClass ?? "Nothing scheduled yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/student/calendar">Open calendar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <QuickActions
            actions={[
              { label: "Continue Learning", href: resumeHref, icon: PlayCircle },
              {
                label: "Join Next Live Class",
                href: "/student/calendar",
                icon: Video,
              },
              { label: "Open Calendar", href: "/student/calendar", icon: CalendarDays },
              { label: "View Resources", href: "/student/resources", icon: FolderOpen },
              { label: "Search", href: "/student/search", icon: Search },
            ]}
          />
        </>
      ) : null}
    </div>
  );
}

export { LearningDashboardView };
