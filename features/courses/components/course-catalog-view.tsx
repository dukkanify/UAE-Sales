"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { BookOpen } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { COURSE_STATUS_LABELS, DIFFICULTY_LABELS } from "@/constants/courses";
import { courseFetch } from "@/features/courses/lib/api";
import type { CourseListItem } from "@/types/courses";

interface CourseCatalogViewProps {
  title: string;
  description: string;
  roleLabel: string;
  /** Filter mode for read-only surfaces */
  mode: "instructor" | "student";
  instructorId?: string | null;
}

/**
 * Read-only course cards for instructor (assigned) / student (enrolled catalog preview).
 * Does not allow content mutation.
 */
function CourseCatalogView({
  title,
  description,
  roleLabel,
  mode,
  instructorId,
}: CourseCatalogViewProps) {
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      // Instructors/students without COURSES_MANAGE cannot hit admin list API.
      // Use public-ish scoped endpoint via query — admin API requires manage.
      // For now instructors see published+assigned via manage if they somehow have it;
      // otherwise show seeded published courses through a soft client filter after a dedicated call.
      // Dedicated read API:
      const params = new URLSearchParams({ pageSize: "50", status: "published" });
      if (mode === "instructor" && instructorId) {
        params.set("instructorId", instructorId);
        params.delete("status");
      }
      const result = await courseFetch<{ data: CourseListItem[] }>(
        `/api/courses/catalog?${params}`,
      );
      if (cancelled) return;
      if (!result.success) {
        setError(result.error ?? "Unable to load courses");
        setCourses([]);
      } else {
        setCourses(result.data?.data ?? []);
        setError(null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, instructorId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: roleLabel }, { label: "Courses" }]}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : error ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Courses unavailable"
          description={error}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={mode === "student" ? "No enrolled courses" : "No assigned courses"}
          description={
            mode === "student"
              ? "When an admin enrolls you, your programs will appear here."
              : "Courses assigned to you will show up in this catalog."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <div
                className="h-28 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${course.coverImageUrl || course.thumbnailUrl || "/images/hero-aviation.svg"})`,
                }}
              />
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <Badge variant="outline">{COURSE_STATUS_LABELS[course.status]}</Badge>
                </div>
                <CardDescription>{course.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  {course.code} · {DIFFICULTY_LABELS[course.difficulty]}
                </p>
                <p className="mt-1">
                  {course.counts.modules} modules · {course.counts.lessons} lessons
                </p>
                {mode === "student" ? (
                  <p className="mt-3 text-xs">Learning player arrives in a later task.</p>
                ) : (
                  <p className="mt-3 text-xs">
                    Teaching tools (lessons player, attendance) arrive later.{" "}
                    <Link href="/instructor/lessons" className="text-primary hover:underline">
                      Lessons
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { CourseCatalogView };
