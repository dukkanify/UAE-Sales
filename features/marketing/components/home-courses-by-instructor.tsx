import Link from "@/components/ui/app-link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstructorCourseGrid } from "@/features/courses/components/course-lane-card";
import { routes } from "@/constants/routes";
import { listPublishedCoursesGroupedByInstructor } from "@/services/courses/course-service";

function HomeCoursesByInstructor() {
  let groups: ReturnType<typeof listPublishedCoursesGroupedByInstructor> = [];
  try {
    groups = listPublishedCoursesGroupedByInstructor(48);
  } catch (error) {
    console.error("[home-courses]", error);
  }

  const total = groups.reduce((sum, g) => sum + g.courses.length, 0);

  return (
    <section id="courses" className="home-courses content-auto">
      <div className="container-app">
        <div className="home-courses-intro">
          <p className="landing-kicker text-primary">Courses</p>
          <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="max-w-[14ch] font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold tracking-[-0.035em] text-foreground leading-[1.05]">
                Published ATPL lanes by instructor
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Open a lane for the full syllabus — then enter the platform to enroll, or book live
                Zoom when you need coaching altitude.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {total > 0 ? (
                <p className="home-courses-count" aria-label={`${total} published courses`}>
                  <span className="home-courses-count-value">{total}</span>
                  <span className="home-courses-count-label">course{total === 1 ? "" : "s"}</span>
                </p>
              ) : null}
              <Button size="lg" variant="outline" className="self-start" asChild>
                <Link href={routes.courses}>
                  Full catalog
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="landing-rule mt-12 opacity-60" />

        {groups.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            Published courses will appear here once instructors go live.
          </p>
        ) : (
          <div className="mt-14 catalog-deck-groups">
            {groups.map((group, groupIndex) => (
              <InstructorCourseGrid
                key={group.instructorId ?? group.instructorName}
                group={group}
                groupIndex={groupIndex}
                ctaLabel="Open lane"
                showInstructorOnCard={false}
                descriptionLines={2}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { HomeCoursesByInstructor };
