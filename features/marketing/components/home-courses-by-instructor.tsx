import Link from "@/components/ui/app-link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABELS } from "@/constants/courses";
import { routes } from "@/constants/routes";
import { safePath } from "@/lib/links/safe-href";
import {
  listPublishedCoursesGroupedByInstructor,
  type InstructorCourseGroup,
} from "@/services/courses/course-service";

function formatHours(minutes: number) {
  if (!minutes) return "Flexible pace";
  const hours = Math.round(minutes / 60);
  return hours <= 1 ? `${minutes} min` : `${hours} hours`;
}

function HomeCourseCard({
  course,
  tone,
  delay,
}: {
  course: InstructorCourseGroup["courses"][number];
  tone: number;
  delay: number;
}) {
  const hasArt = Boolean(course.coverImageUrl || course.thumbnailUrl);

  return (
    <article className="course-lane" style={{ animationDelay: `${delay}s` }}>
      <div
        className="course-lane-cover"
        data-tone={String(tone % 4)}
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
        <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-foreground">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.shortDescription || course.fullDescription}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[rgb(18_36_51_/0.1)] pt-4">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5 text-primary/70" />
            {formatHours(course.estimatedDurationMinutes)}
          </p>
          <Button size="sm" variant="accent" className="hero-cta-primary" asChild>
            <Link href={safePath(["courses", course.id], routes.courses)}>
              Open lane
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
    <section id="courses" className="platform-altitude content-auto py-28 sm:py-36">
      <div className="container-app">
        <p className="landing-kicker mb-5 text-primary">Courses</p>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
              Every course under its instructor
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pick a training lane by instructor — then enter the platform or book live Zoom when
              you need coaching altitude.
            </p>
          </div>
          <Button size="lg" variant="outline" className="self-start lg:self-auto" asChild>
            <Link href={routes.courses}>
              Full catalog
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="landing-rule mt-12 opacity-60" />

        {groups.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            Published courses will appear here once instructors go live.
          </p>
        ) : (
          <div className="mt-14 space-y-16">
            {groups.map((group, groupIndex) => (
              <div key={group.instructorId ?? group.instructorName}>
                <div className="course-instructor-rail">
                  <div>
                    <p className="landing-kicker text-muted-foreground">Instructor</p>
                    <h3 className="course-instructor-name mt-2 text-foreground">
                      {group.instructorName}
                    </h3>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {group.courses.length} lane{group.courses.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="mt-6 grid gap-0 sm:grid-cols-2 xl:grid-cols-3 sm:gap-px sm:bg-[rgb(18_36_51_/0.08)]">
                  {group.courses.map((course, index) => (
                    <HomeCourseCard
                      key={course.id}
                      course={course}
                      tone={groupIndex + index}
                      delay={0.06 + index * 0.07}
                    />
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
