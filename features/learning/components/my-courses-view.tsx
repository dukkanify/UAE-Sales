"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Bookmark, PlayCircle, Search, Star } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { learningFetch, learningJson } from "@/features/learning/lib/api";
import { safePath } from "@/lib/links/safe-href";
import type { CourseLearningState } from "@/types/learning";
import type { CourseListItem } from "@/types/courses";

type CourseRow = CourseListItem & { learning: CourseLearningState | null };

function MyCoursesView() {
  const [courses, setCourses] = React.useState<CourseRow[]>([]);
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"recent" | "title" | "progress">("recent");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, q });
    const result = await learningFetch<CourseRow[]>(`/api/learning/courses?${params}`);
    if (!result.success) {
      setError(result.error ?? "Unable to load courses");
      setCourses([]);
    } else {
      setCourses(result.data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [q, sort]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(t);
  }, [load]);

  async function toggleFavorite(course: CourseRow) {
    const existing = course.learning?.favorited;
    if (existing) {
      const favs =
        await learningFetch<Array<{ id: string; targetId: string }>>("/api/learning/favorites");
      const row = favs.data?.find((f) => f.targetId === course.id);
      if (row) await learningJson(`/api/learning/favorites/${row.id}`, "DELETE");
    } else {
      await learningJson("/api/learning/favorites", "POST", {
        targetType: "course",
        targetId: course.id,
        label: course.title,
      });
    }
    void load();
  }

  async function bookmarkCourse(course: CourseRow) {
    await learningJson("/api/learning/bookmarks", "POST", {
      targetType: "section",
      targetId: course.id,
      courseId: course.id,
      label: course.title,
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My courses"
        description="Search, filter, and continue enrolled programs."
        breadcrumbs={[{ label: "Student" }, { label: "My Courses" }]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search courses…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort courses"
        >
          <option value="recent">Recently accessed</option>
          <option value="title">Title</option>
          <option value="progress">Progress</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<PlayCircle className="h-6 w-6" />}
          title="No enrolled courses"
          description="When you enroll in a program it will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const pct = Math.round(course.learning?.progressPercent ?? 0);
            const resumeId = course.learning?.lastLessonId;
            const href = resumeId
              ? safePath(["student", "courses", course.id, "lessons", resumeId], "/student/courses")
              : safePath(["student", "courses", course.id], "/student/courses");
            return (
              <Card key={course.id} className="flex flex-col overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="font-display text-xl leading-tight">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {course.shortDescription}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {DIFFICULTY_LABELS[course.difficulty] ?? course.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {course.learning?.completedLessons ?? 0}/
                        {course.learning?.totalLessons ?? 0} lessons
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={href}>
                        <PlayCircle className="size-4" />
                        Continue
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void toggleFavorite(course)}>
                      <Star
                        className={`size-4 ${course.learning?.favorited ? "fill-current" : ""}`}
                      />
                      Favorite
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void bookmarkCourse(course)}>
                      <Bookmark className="size-4" />
                      Bookmark
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { MyCoursesView };
