"use client";

import {
  Archive,
  BookOpen,
  FileEdit,
  FolderTree,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/dashboard";
import type { CourseStats } from "@/types/courses";

interface CourseStatsWidgetsProps {
  stats: CourseStats | null;
  loading?: boolean;
}

function CourseStatsWidgets({ stats, loading }: CourseStatsWidgetsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard
        label="Total courses"
        value={loading ? "—" : (stats?.totalCourses ?? 0)}
        icon={BookOpen}
      />
      <StatCard
        label="Published"
        value={loading ? "—" : (stats?.publishedCourses ?? 0)}
        icon={BookOpen}
        hint="Live in catalog"
      />
      <StatCard
        label="Drafts"
        value={loading ? "—" : (stats?.draftCourses ?? 0)}
        icon={FileEdit}
      />
      <StatCard
        label="Archived"
        value={loading ? "—" : (stats?.archivedCourses ?? 0)}
        icon={Archive}
      />
      <StatCard
        label="Active students"
        value={loading ? "—" : (stats?.activeStudents ?? 0)}
        icon={Users}
        hint="Approved enrollments"
      />
      <StatCard
        label="Categories"
        value={loading ? "—" : (stats?.totalCategories ?? 0)}
        icon={FolderTree}
      />
    </div>
  );
}

export { CourseStatsWidgets };
