"use client";

import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  HelpCircle,
  PlayCircle,
  Video,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  StatCard,
  ProgressWidget,
  QuickActions,
  CalendarWidget,
  ChartCard,
  AreaTrendChart,
  type SeriesPoint,
  type CalendarEvent,
} from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentDashboardViewProps {
  overview: {
    currentCourses: number;
    nextLiveClass: string;
    progress: number;
    certificates: number;
    notifications: number;
    assignments: number;
    quizzes: number;
    weeklyProgress: number;
    attendance: number;
    learningHours: number;
  };
  calendar: CalendarEvent[];
  attendance: SeriesPoint[];
}

function StudentDashboardView({
  overview,
  calendar,
  attendance,
}: StudentDashboardViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning dashboard"
        description="Continue your aviation training journey."
        breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current courses" value={overview.currentCourses} icon={BookOpen} />
        <StatCard label="Next live class" value="Tomorrow" hint={overview.nextLiveClass} icon={Video} />
        <StatCard label="Progress" value={`${overview.progress}%`} icon={PlayCircle} />
        <StatCard label="Certificates" value={overview.certificates} icon={Award} />
        <StatCard label="Notifications" value={overview.notifications} icon={HelpCircle} />
        <StatCard label="Assignments" value={overview.assignments} icon={ClipboardList} />
        <StatCard label="Quizzes" value={overview.quizzes} icon={HelpCircle} />
        <StatCard label="Calendar" value="This week" hint="5 upcoming events" icon={CalendarDays} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ProgressWidget title="Overall progress" value={overview.progress} label="All courses" />
        <ProgressWidget title="Weekly progress" value={overview.weeklyProgress} label="This week" />
        <ProgressWidget title="Attendance" value={overview.attendance} label="Live sessions" />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold">{overview.learningHours}h</p>
            <p className="mt-1 text-xs text-muted-foreground">Logged this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weekly attendance">
          <AreaTrendChart data={attendance} />
        </ChartCard>
        <CalendarWidget events={calendar} title="My calendar" />
      </div>

      <QuickActions
        actions={[
          { label: "Continue Learning", href: "/student/courses", icon: PlayCircle },
          { label: "Join Next Class", href: "/student/calendar", icon: Video },
          { label: "Open Calendar", href: "/student/calendar", icon: CalendarDays },
          { label: "View Certificates", href: "/student/certificates", icon: Award },
        ]}
      />
    </div>
  );
}

export { StudentDashboardView };
