import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { InstructorCourseGrid } from "@/features/courses/components/course-lane-card";
import { listPublishedCoursesGroupedByInstructor } from "@/services/courses/course-service";

/** Server-rendered public catalog — no client fetch, always shows published lanes. */
function PublicCourseCatalog() {
  let groups: ReturnType<typeof listPublishedCoursesGroupedByInstructor> = [];
  try {
    groups = listPublishedCoursesGroupedByInstructor(100);
  } catch (error) {
    console.error("[public-course-catalog]", error);
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="Courses temporarily unavailable"
        description="We could not load the published catalog right now. Please try again in a moment."
      />
    );
  }
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
    <div className="catalog-deck">
      <header className="catalog-deck-header">
        <div className="catalog-deck-copy">
          <p className="landing-kicker text-primary">Course catalog</p>
          <h2 className="catalog-deck-title">
            {total} course{total === 1 ? "" : "s"} ready to fly
          </h2>
          <p className="catalog-deck-lead">
            Browse by instructor, open a lane for the syllabus, then enroll or book live Zoom
            coaching on AviatorPass.
          </p>
        </div>
        <aside className="catalog-deck-meta" aria-label="Catalog summary">
          <div className="catalog-deck-stat">
            <span className="catalog-deck-stat-value">{total}</span>
            <span className="catalog-deck-stat-label">lanes</span>
          </div>
          <div className="catalog-deck-stat-divider" aria-hidden />
          <div className="catalog-deck-stat">
            <span className="catalog-deck-stat-value">{groups.length}</span>
            <span className="catalog-deck-stat-label">
              instructor{groups.length === 1 ? "" : "s"}
            </span>
          </div>
        </aside>
      </header>

      <div className="catalog-deck-groups">
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
    </div>
  );
}

export { PublicCourseCatalog };
