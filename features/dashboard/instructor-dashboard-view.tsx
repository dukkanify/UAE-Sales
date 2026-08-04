"use client";

import {
  BookOpen,
  CalendarPlus,
  ClipboardList,
  FileUp,
  HelpCircle,
  Users,
  Video,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  StatCard,
  ChartCard,
  LineTrendChart,
  BarsChart,
  DonutChart,
  QuickActions,
  CalendarWidget,
  type SeriesPoint,
  type CalendarEvent,
} from "@/components/dashboard";
import { formatCurrency } from "@/utils/format";

interface InstructorDashboardViewProps {
  overview: {
    myCourses: number;
    todaysClasses: number;
    upcomingClasses: number;
    students: number;
    assignments: number;
    quizzes: number;
    earnings: number;
    walletBalance: number;
  };
  earnings: SeriesPoint[];
  attendance: SeriesPoint[];
  progress: { name: string; value: number }[];
  calendar: CalendarEvent[];
}

function InstructorDashboardView({
  overview,
  earnings,
  attendance,
  progress,
  calendar,
}: InstructorDashboardViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teaching workspace"
        description="Courses, schedule, students, and earnings at a glance."
        breadcrumbs={[{ label: "Instructor" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My courses" value={overview.myCourses} icon={BookOpen} />
        <StatCard label="Today's classes" value={overview.todaysClasses} icon={Video} />
        <StatCard label="Upcoming classes" value={overview.upcomingClasses} icon={CalendarPlus} />
        <StatCard label="Students" value={overview.students} icon={Users} />
        <StatCard label="Assignments" value={overview.assignments} icon={ClipboardList} />
        <StatCard label="Quizzes" value={overview.quizzes} icon={HelpCircle} />
        <StatCard label="Earnings" value={formatCurrency(overview.earnings)} icon={Wallet} />
        <StatCard label="Wallet balance" value={formatCurrency(overview.walletBalance)} icon={Wallet} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Monthly earnings" className="xl:col-span-2">
          <LineTrendChart data={earnings} />
        </ChartCard>
        <ChartCard title="Student progress" heightClassName="h-72">
          <DonutChart data={progress} />
        </ChartCard>
        <ChartCard title="Attendance" className="xl:col-span-2">
          <BarsChart data={attendance} />
        </ChartCard>
        <CalendarWidget events={calendar} title="My schedule" />
      </div>

      <QuickActions
        actions={[
          { label: "Create Lesson", href: "/instructor/lessons", icon: BookOpen },
          { label: "Schedule Zoom Session", href: "/instructor/calendar", icon: Video },
          { label: "Upload Material", href: "/instructor/courses", icon: FileUp },
          { label: "Create Quiz", href: "/instructor/quizzes", icon: HelpCircle },
        ]}
      />
    </div>
  );
}

export { InstructorDashboardView };
