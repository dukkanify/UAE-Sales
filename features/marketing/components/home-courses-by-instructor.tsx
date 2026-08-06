import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { routes } from "@/constants/routes";
import {
  listPublishedCoursesGroupedByInstructor,
  type InstructorCourseGroup,
} from "@/services/courses/course-service";

function formatHours(minutes: number) {
  if (!minutes) return "Flexible pace";
  const hours = Math.round(minutes / 60);
  return hours <= 1 ? `${minutes} min` : `${hours} hours`;
}

function HomeCourseCard({ course }: { course: InstructorCourseGroup["courses"][number] }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium">
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: `url(${course.coverImageUrl || course.thumbnailUrl || "/images/hero-aviation.svg"})`,
        }}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{DIFFICULTY_LABELS[course.difficulty]}</Badge>
          {course.categoryName ? (
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {course.categoryName}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.shortDescription || course.fullDescription}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {formatHours(course.estimatedDurationMinutes)}
          </p>
          <Button size="sm" variant="accent" asChild>
            <Link href={`${routes.courses}/${course.id}`}>
              View
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function HomeCoursesByInstructor() {
  const groups = listPublishedCoursesGroupedByInstructor(48);

  return (
    <section id="courses" className="platform-surface content-auto py-28 sm:py-36">
      <div className="container-app">
        <p className="landing-kicker mb-5 text-primary">Courses</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[18ch] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
              Learn with the instructor on your course
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every published program sits under its instructor — pick a lane, then book live Zoom
              when you need coaching.
            </p>
          </div>
          <Button size="lg" variant="outline" asChild>
            <Link href={routes.courses}>
              Full catalog
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {groups.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            Published courses will appear here once instructors go live.
          </p>
        ) : (
          <div className="mt-16 space-y-16">
            {groups.map((group) => (
              <div key={group.instructorId ?? group.instructorName}>
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/50 pb-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Instructor
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                      {group.instructorName}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.courses.length} course{group.courses.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {group.courses.map((course) => (
                    <HomeCourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { HomeCoursesByInstructor };
