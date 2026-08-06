"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { routes } from "@/constants/routes";
import type { CourseListItem } from "@/types/courses";

function formatHours(minutes: number) {
  if (!minutes) return "Flexible pace";
  const hours = Math.round(minutes / 60);
  return hours <= 1 ? `${minutes} min` : `${hours} hours`;
}

function PublicCourseCatalog() {
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/public/courses?pageSize=24&sortBy=title&sortDir=asc", {
          credentials: "include",
        });
        const json = (await res.json()) as {
          success?: boolean;
          data?: { data?: CourseListItem[] } | CourseListItem[];
          error?: string | null;
        };
        if (cancelled) return;
        if (!json.success) {
          setError(json.error || "Unable to load courses");
          setCourses([]);
        } else {
          const payload = json.data;
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : [];
          setCourses(list);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load courses");
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-px bg-[rgb(18_36_51_/0.08)] sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-none" />
        <Skeleton className="h-72 rounded-none" />
        <Skeleton className="h-72 rounded-none" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="Courses unavailable"
        description={error}
      />
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="No published courses yet"
        description="Published ATPL programs will appear here for learners and visitors."
      />
    );
  }

  return (
    <div className="grid gap-px bg-[rgb(18_36_51_/0.08)] sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course, index) => {
        const hasArt = Boolean(course.coverImageUrl || course.thumbnailUrl);
        return (
          <article
            key={course.id}
            className="course-lane"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className="course-lane-cover"
              data-tone={String(index % 4)}
              style={
                hasArt
                  ? {
                      backgroundImage: `linear-gradient(180deg, transparent 25%, rgba(3,8,12,0.55)), url(${course.coverImageUrl || course.thumbnailUrl})`,
                    }
                  : undefined
              }
            />
            <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span>{DIFFICULTY_LABELS[course.difficulty]}</span>
                {course.categoryName ? (
                  <span className="text-primary/80">{course.categoryName}</span>
                ) : null}
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-foreground">
                {course.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {course.shortDescription || course.fullDescription}
              </p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[rgb(18_36_51_/0.1)] pt-4">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground/85">
                    {course.primaryInstructorName || "AviatorPass faculty"}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-primary/70" />
                    {formatHours(course.estimatedDurationMinutes)}
                  </p>
                </div>
                <Button size="sm" variant="accent" className="hero-cta-primary shrink-0" asChild>
                  <Link href={`${routes.courses}/${course.id}`}>
                    Open lane
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export { PublicCourseCatalog };
