"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";
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
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
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
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course, index) => (
        <article
          key={course.id}
          className={cn(
            "group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium",
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div
            className="h-40 bg-cover bg-center"
            style={{
              backgroundImage: `url(${course.coverImageUrl || course.thumbnailUrl || "/images/hero-aviation.svg"})`,
            }}
          />
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{DIFFICULTY_LABELS[course.difficulty]}</Badge>
              {course.categoryName ? (
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {course.categoryName}
                </span>
              ) : null}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
              {course.title}
            </h2>
            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {course.shortDescription || course.fullDescription}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {formatHours(course.estimatedDurationMinutes)}
              </p>
              <Button size="sm" variant="accent" asChild>
                <Link href={`${routes.courses}/${course.id}`}>
                  View course
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export { PublicCourseCatalog };
