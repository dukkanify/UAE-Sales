import Link from "@/components/ui/app-link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import { DIFFICULTY_LABELS } from "@/constants/courses";
import { publicCourseHref } from "@/lib/courses/public-course-path";
import { cn } from "@/lib/utils";
import type { InstructorCourseGroup } from "@/services/courses/course-service";

type CatalogCourse = InstructorCourseGroup["courses"][number];

function formatHours(minutes: number) {
  if (!minutes) return "Flexible pace";
  const hours = Math.round(minutes / 60);
  return hours <= 1 ? `${minutes} min` : `${hours} hours`;
}

/** Generic SVG placeholders are not real cover art — prefer tonal lanes. */
function resolveCoverArt(course: CatalogCourse): string | null {
  const raw = (course.coverImageUrl || course.thumbnailUrl || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.endsWith(".svg") || lower.includes("hero-aviation")) return null;
  return raw;
}

function instructorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AP";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function CourseLaneCover({ course, tone }: { course: CatalogCourse; tone: number }) {
  const art = resolveCoverArt(course);
  const code = course.code?.trim() || "ATPL";

  return (
    <div
      className="course-lane-cover"
      data-tone={String(tone % 4)}
      style={
        art
          ? {
              backgroundImage: `linear-gradient(165deg, rgba(3,8,12,0.12) 0%, rgba(3,8,12,0.82) 100%), url(${art})`,
            }
          : undefined
      }
    >
      <div className="course-lane-cover-grid" aria-hidden />
      <div className="course-lane-cover-glow" aria-hidden />
      <div className="course-lane-cover-horizon" aria-hidden />
      <div className="course-lane-cover-beam" aria-hidden />
      <div className="course-lane-cover-meta">
        <span className="course-lane-cover-code">{code}</span>
        <span className="course-lane-cover-label">{DIFFICULTY_LABELS[course.difficulty]}</span>
      </div>
    </div>
  );
}

function CourseLaneCard({
  course,
  tone,
  delay,
  ctaLabel = "View course",
  showInstructor = true,
  descriptionLines = 3,
}: {
  course: CatalogCourse;
  tone: number;
  delay: number;
  ctaLabel?: string;
  showInstructor?: boolean;
  descriptionLines?: 2 | 3;
}) {
  const href = publicCourseHref(course);

  return (
    <article className="course-lane" style={{ animationDelay: `${delay}s` }}>
      <Link href={href} className="course-lane-hit" aria-label={`Open ${course.title}`}>
        <CourseLaneCover course={course} tone={tone} />
        <div className="course-lane-body">
          <div className="course-lane-tags">
            {course.categoryName ? (
              <span className="course-lane-tag">{course.categoryName}</span>
            ) : null}
            {course.counts.modules > 0 ? (
              <span className="course-lane-tag muted">{course.counts.modules} modules</span>
            ) : null}
          </div>
          <h3 className="course-lane-title">{course.title}</h3>
          <p
            className={
              descriptionLines === 2
                ? "course-lane-copy line-clamp-2"
                : "course-lane-copy line-clamp-3"
            }
          >
            {course.shortDescription || course.fullDescription}
          </p>
          <div className="course-lane-footer">
            <div className="min-w-0">
              {showInstructor ? (
                <p className="truncate text-xs font-medium text-foreground/85">
                  {course.primaryInstructorName || "AviatorPass faculty"}
                </p>
              ) : null}
              <p
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
                  showInstructor && "mt-0.5",
                )}
              >
                <Clock3 className="h-3.5 w-3.5 text-primary/70" />
                {formatHours(course.estimatedDurationMinutes)}
              </p>
            </div>
            <span className="course-lane-cta">
              {ctaLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function InstructorCourseGrid({
  group,
  groupIndex,
  ctaLabel,
  showInstructorOnCard = true,
  descriptionLines = 3,
}: {
  group: InstructorCourseGroup;
  groupIndex: number;
  ctaLabel?: string;
  showInstructorOnCard?: boolean;
  descriptionLines?: 2 | 3;
}) {
  return (
    <section className="course-instructor-block" data-index={groupIndex}>
      <div className="course-instructor-rail">
        <div className="course-instructor-identity">
          <span className="course-instructor-mark" aria-hidden>
            {instructorInitials(group.instructorName)}
          </span>
          <div>
            <p className="landing-kicker text-muted-foreground">Instructor</p>
            <h3 className="course-instructor-name mt-2 text-foreground">{group.instructorName}</h3>
          </div>
        </div>
        <p className="course-instructor-count">
          {group.courses.length} lane{group.courses.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="course-lane-grid">
        {group.courses.map((course, index) => (
          <CourseLaneCard
            key={course.id}
            course={course}
            tone={groupIndex + index}
            delay={0.04 + index * 0.05}
            ctaLabel={ctaLabel}
            showInstructor={showInstructorOnCard}
            descriptionLines={descriptionLines}
          />
        ))}
      </div>
    </section>
  );
}

export { CourseLaneCard, InstructorCourseGrid, formatHours, resolveCoverArt };
export type { CatalogCourse };
