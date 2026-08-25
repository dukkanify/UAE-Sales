"use client";

import {
  BookOpen,
  CreditCard,
  DollarSign,
  GraduationCap,
  Layers,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  FileBarChart,
  Settings,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  StatCard,
  ChartCard,
  AreaTrendChart,
  LineTrendChart,
  BarsChart,
  QuickActions,
  RecentActivity,
  CalendarWidget,
  type SeriesPoint,
  type ActivityItem,
  type CalendarEvent,
} from "@/components/dashboard";
import { formatCurrency } from "@/utils/format";

interface SuperAdminDashboardViewProps {
  overview: {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    activeClasses: number;
    monthlyRevenue: number;
    instructorWalletBalance: number;
    pendingPayments: number;
    platformGrowth: number;
  };
  growth: SeriesPoint[];
  revenue: SeriesPoint[];
  enrollments: SeriesPoint[];
  attendance: SeriesPoint[];
  activity: ActivityItem[];
  calendar: CalendarEvent[];
}

function SuperAdminDashboardView({
  overview,
  growth,
  revenue,
  enrollments,
  attendance,
  activity,
  calendar,
}: SuperAdminDashboardViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Students, instructors, courses, and revenue across ATPL PASS."
        breadcrumbs={[{ label: "Super Admin" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={overview.totalStudents} icon={Users} />
        <StatCard label="Instructors" value={overview.totalInstructors} icon={GraduationCap} />
        <StatCard label="Courses" value={overview.totalCourses} icon={BookOpen} />
        <StatCard
          label="Active classes"
          value={overview.activeClasses}
          icon={Layers}
          hint="Live or scheduled this week"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly revenue"
          value={formatCurrency(overview.monthlyRevenue)}
          icon={DollarSign}
          hint={
            overview.platformGrowth
              ? `${overview.platformGrowth >= 0 ? "+" : ""}${overview.platformGrowth}% vs prior period`
              : undefined
          }
        />
        <StatCard
          label="Instructor wallets"
          value={formatCurrency(overview.instructorWalletBalance)}
          icon={Wallet}
        />
        <StatCard
          label="Pending payments"
          value={overview.pendingPayments}
          icon={CreditCard}
          hint="Awaiting settlement"
        />
        <StatCard label="Period growth" value={`${overview.platformGrowth}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Student growth" description="Cumulative student registrations">
          <AreaTrendChart data={growth} gradientId="saGrowthFill" />
        </ChartCard>
        <ChartCard title="Revenue trend" description="Monthly platform revenue">
          <LineTrendChart data={revenue} />
        </ChartCard>
        <ChartCard title="Course enrollments" description="By program track">
          <BarsChart data={enrollments} />
        </ChartCard>
        <ChartCard title="Attendance" description="Live session attendance this week">
          <BarsChart data={attendance} />
        </ChartCard>
      </div>

      <CalendarWidget events={calendar} title="Platform calendar" />

      <div className="grid gap-4 lg:grid-cols-2">
        <QuickActions
          actions={[
            {
              label: "Create admin",
              href: "/super-admin/admins",
              icon: UserPlus,
              description: "Invite an administrator",
            },
            {
              label: "Add instructor",
              href: "/super-admin/instructors",
              icon: GraduationCap,
              description: "Onboard teaching staff",
            },
            {
              label: "Create course",
              href: "/super-admin/courses",
              icon: BookOpen,
              description: "Open the course catalog",
            },
            {
              label: "Reports",
              href: "/super-admin/reports",
              icon: FileBarChart,
              description: "Analytics and exports",
            },
            {
              label: "Platform settings",
              href: "/super-admin/settings",
              icon: Settings,
              description: "System configuration",
            },
          ]}
        />
        <RecentActivity items={activity} viewAllHref="/super-admin/activity-logs" />
      </div>
    </div>
  );
}

export { SuperAdminDashboardView };
