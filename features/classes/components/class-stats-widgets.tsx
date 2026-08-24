"use client";

import { CalendarClock, Radio, Users, XCircle, CheckCircle2, Video } from "lucide-react";

import { StatCard } from "@/components/dashboard";

interface ClassStatsWidgetsProps {
  stats: {
    today: number;
    upcoming: number;
    liveNow: number;
    completed: number;
    cancelled: number;
    attendanceRate: number;
  } | null;
  loading?: boolean;
}

function ClassStatsWidgets({ stats, loading }: ClassStatsWidgetsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Today" value={loading ? "—" : (stats?.today ?? 0)} icon={CalendarClock} />
      <StatCard label="Upcoming" value={loading ? "—" : (stats?.upcoming ?? 0)} icon={Video} />
      <StatCard label="Live now" value={loading ? "—" : (stats?.liveNow ?? 0)} icon={Radio} />
      <StatCard
        label="Completed"
        value={loading ? "—" : (stats?.completed ?? 0)}
        icon={CheckCircle2}
      />
      <StatCard
        label="Cancelled"
        value={loading ? "—" : (stats?.cancelled ?? 0)}
        icon={XCircle}
      />
      <StatCard
        label="Attendance rate"
        value={loading ? "—" : `${stats?.attendanceRate ?? 0}%`}
        icon={Users}
      />
    </div>
  );
}

export { ClassStatsWidgets };
