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
