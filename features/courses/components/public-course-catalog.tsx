import Link from "@/components/ui/app-link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
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

function CatalogCourseCard({
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
          {course.code ? <span className="text-foreground/45">{course.code}</span> : null}
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
              {course.counts.modules > 0 ? (
                <span className="text-foreground/40">· {course.counts.modules} modules</span>
              ) : null}
            </p>
          </div>
          <Button size="sm" variant="accent" className="hero-cta-primary shrink-0" asChild>
            <Link href={safePath(["courses", course.id], routes.courses)}>
              View course
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Server-rendered public catalog — no client fetch, always shows published lanes. */
function PublicCourseCatalog() {
  const groups = listPublishedCoursesGroupedByInstructor(100);
  const total = groups.reduce((sum, g) => sum + g.courses.length, 0);

  if (total === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="No published courses yet"
        description="Published ATPL programs will appear here for learners and visitors."
      />
    );
  }

  return (
    <div className="space-y-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="landing-kicker text-primary">Published lanes</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.03em] text-foreground">
            {total} course{total === 1 ? "" : "s"} ready to fly
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Browse by instructor, open a lane for the syllabus, then enter AviatorPass to enroll or
            book live Zoom coaching.
          </p>
        </div>
        <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {groups.length} instructor{groups.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="landing-rule opacity-60" />

      <div className="space-y-16">
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
                <CatalogCourseCard
                  key={course.id}
                  course={course}
                  tone={groupIndex + index}
                  delay={0.04 + index * 0.05}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PublicCourseCatalog };
