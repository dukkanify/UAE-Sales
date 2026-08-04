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
        title="Executive overview"
        description="Platform health, growth, and operational controls."
        breadcrumbs={[{ label: "Super Admin" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={overview.totalStudents} icon={Users} trend={{ value: 12, label: "vs last month" }} />
        <StatCard label="Total instructors" value={overview.totalInstructors} icon={GraduationCap} trend={{ value: 8, label: "vs last month" }} />
        <StatCard label="Total courses" value={overview.totalCourses} icon={BookOpen} hint="Catalog foundation ready" />
        <StatCard label="Active classes" value={overview.activeClasses} icon={Layers} hint="Live this week" />
        <StatCard label="Monthly revenue" value={formatCurrency(overview.monthlyRevenue)} icon={DollarSign} trend={{ value: overview.platformGrowth, label: "growth" }} />
        <StatCard label="Instructor wallets" value={formatCurrency(overview.instructorWalletBalance)} icon={Wallet} />
        <StatCard label="Pending payments" value={overview.pendingPayments} icon={CreditCard} hint="Awaiting settlement" />
        <StatCard label="Platform growth" value={`${overview.platformGrowth}%`} icon={TrendingUp} trend={{ value: overview.platformGrowth }} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Student growth" description="New student registrations over time">
          <AreaTrendChart data={growth} />
        </ChartCard>
        <ChartCard title="Revenue trend" description="Monthly platform revenue">
          <LineTrendChart data={revenue} />
        </ChartCard>
        <ChartCard title="Course enrollments" description="By program track">
          <BarsChart data={enrollments} />
        </ChartCard>
        <ChartCard title="Attendance overview" description="Live session attendance this week">
          <BarsChart data={attendance} />
        </ChartCard>
      </div>

      <CalendarWidget events={calendar} title="Platform calendar" />

      <div className="grid gap-4 lg:grid-cols-2">
        <QuickActions
          actions={[
            { label: "Create Admin", href: "/super-admin/admins", icon: UserPlus, description: "Invite a new administrator" },
            { label: "Create Instructor", href: "/super-admin/instructors", icon: GraduationCap, description: "Add teaching staff" },
            { label: "Create Course", href: "/super-admin/courses", icon: BookOpen, description: "Open course builder shell" },
            { label: "View Reports", href: "/super-admin/reports", icon: FileBarChart, description: "Analytics & exports" },
            { label: "Platform Settings", href: "/super-admin/settings", icon: Settings, description: "System configuration" },
          ]}
        />
        <RecentActivity items={activity} viewAllHref="/super-admin/activity-logs" />
      </div>
    </div>
  );
}

export { SuperAdminDashboardView };
