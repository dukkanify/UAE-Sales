"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { COURSE_STATUS_LABELS, DIFFICULTY_LABELS } from "@/constants/courses";
import { courseFetch } from "@/features/courses/lib/api";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import { authFetch } from "@/features/auth/services/auth-api";
import type { CourseCategory, CourseListItem } from "@/types/courses";
import type { UserProfile } from "@/types";

function InstructorCoursesManager() {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [categories, setCategories] = React.useState<CourseCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CourseListItem | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const me = await authFetch<{ user: UserProfile; isAuthenticated: boolean }>("/api/auth/me");
    const current = me.data?.user ?? null;
    setUser(current);

    const [catalog, cats] = await Promise.all([
      courseFetch<{ data: CourseListItem[] }>("/api/courses/catalog?pageSize=50"),
      courseFetch<CourseCategory[]>("/api/courses/categories"),
    ]);

    if (!catalog.success) {
      setError(catalog.error ?? "Unable to load courses");
      setCourses([]);
    } else {
      setCourses(catalog.data?.data ?? []);
      setError(null);
    }
    setCategories(cats.success && Array.isArray(cats.data) ? cats.data : []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const instructors = user
    ? [
        {
          ...user,
          fullName: user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My courses"
        description="Create and manage courses under your instructor account. Students see published courses grouped by instructor."
        breadcrumbs={[{ label: "Instructor" }, { label: "Courses" }]}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
            disabled={!user}
          >
            <Plus className="h-4 w-4" />
            Add course
          </Button>
        }
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
          title="No courses yet"
          description="Add your first ATPL course. Publish it when students should see it on the home page."
          actionLabel="Add course"
          onAction={() => {
            setEditing(null);
            setCreateOpen(true);
          }}
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
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  {course.code} · {DIFFICULTY_LABELS[course.difficulty]}
                </p>
                <p>
                  {course.counts.modules} modules · {course.counts.lessons} lessons
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(course);
                      setCreateOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href="/instructor/lessons">Lessons</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {user ? (
        <CourseFormDialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setEditing(null);
          }}
          course={editing}
          categories={categories}
          instructors={instructors}
          lockedInstructorId={user.id}
          onSaved={(saved) => {
            setCourses((prev) => {
              const idx = prev.findIndex((c) => c.id === saved.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = saved;
                return next;
              }
              return [saved, ...prev];
            });
            toast.success(editing ? "Course updated" : "Course created under your account");
            void load();
          }}
        />
      ) : null}
    </div>
  );
}

export { InstructorCoursesManager };
