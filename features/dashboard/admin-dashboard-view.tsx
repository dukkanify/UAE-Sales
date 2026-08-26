"use client";

import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Layers,
  Megaphone,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  StatCard,
  ChartCard,
  BarsChart,
  AreaTrendChart,
  QuickActions,
  RecentActivity,
  CalendarWidget,
  type SeriesPoint,
  type ActivityItem,
  type CalendarEvent,
} from "@/components/dashboard";

interface AdminDashboardViewProps {
  overview: {
    students: number;
    instructors: number;
    courses: number;
    liveClasses: number;
    pendingApprovals: number;
    communityReports: number;
    blogActivity: number;
  };
  growth: SeriesPoint[];
  enrollments: SeriesPoint[];
  activity: ActivityItem[];
  calendar: CalendarEvent[];
}

function AdminDashboardView({
  overview,
  growth,
  enrollments,
  activity,
  calendar,
}: AdminDashboardViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Students, instructors, classes, and academy content."
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={overview.students} icon={Users} />
        <StatCard label="Instructors" value={overview.instructors} icon={GraduationCap} />
        <StatCard label="Courses" value={overview.courses} icon={BookOpen} />
        <StatCard label="Live classes" value={overview.liveClasses} icon={Layers} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Pending approvals"
          value={overview.pendingApprovals}
          icon={ClipboardList}
          hint="Accounts awaiting review"
        />
        <StatCard
          label="Moderation queue"
          value={overview.communityReports}
          icon={Megaphone}
          hint="Flagged or blocked items"
        />
        <StatCard
          label="Published posts"
          value={overview.blogActivity}
          icon={BookOpen}
          hint="Updated this month"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Student growth">
          <AreaTrendChart data={growth} />
        </ChartCard>
        <ChartCard title="Enrollments by track">
          <BarsChart data={enrollments} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <QuickActions
          actions={[
            { label: "Add student", href: "/admin/students", icon: UserPlus },
            { label: "Add instructor", href: "/admin/instructors", icon: GraduationCap },
            { label: "Schedule class", href: "/admin/classes", icon: Layers },
            { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
          ]}
        />
        <div className="space-y-4">
          <CalendarWidget events={calendar} />
          <RecentActivity items={activity} />
        </div>
      </div>
    </div>
  );
}

export { AdminDashboardView };
