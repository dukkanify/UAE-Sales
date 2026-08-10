/**
 * Course publishing & public visibility rules (CR001).
 */

import { getPlatformSettings } from "@/services/settings/settings-service";
import type { Course, CourseDeliveryType, PublicCourseDeliveryFilter } from "@/types/courses";

export function normalizeCoursePublishingFields<T extends Partial<Course>>(
  course: T,
): T & Pick<Course, "deliveryType" | "enrollmentOpen" | "hidden"> {
  const deliveryType: CourseDeliveryType =
    course.deliveryType === "live" || course.deliveryType === "recorded"
      ? course.deliveryType
      : "recorded";
  const enrollmentOpen =
    typeof course.enrollmentOpen === "boolean"
      ? course.enrollmentOpen
      : course.enrollmentMode === "open";
  const hidden = Boolean(course.hidden);
  return {
    ...course,
    deliveryType,
    enrollmentOpen,
    hidden,
  };
}

export function getPublicDeliveryFilter(): PublicCourseDeliveryFilter {
  const filter = getPlatformSettings().courses?.publicDeliveryFilter;
  if (filter === "recorded" || filter === "live" || filter === "all") return filter;
  return "all";
}

/** Whether a course may appear on public marketing/catalog surfaces. */
export function isCoursePubliclyListed(
  course: Pick<Course, "status" | "hidden" | "deletedAt" | "deliveryType" | "code" | "title">,
  opts?: { deliveryFilter?: PublicCourseDeliveryFilter },
): boolean {
  if (course.deletedAt) return false;
  if (course.hidden) return false;
  if (course.status !== "published") return false;

  const filter = opts?.deliveryFilter ?? getPublicDeliveryFilter();
  if (filter !== "all" && course.deliveryType !== filter) return false;
  return true;
}

/** Whether new enrollments are allowed for this course. */
export function canAcceptEnrollment(
  course: Pick<Course, "status" | "hidden" | "deletedAt" | "enrollmentOpen">,
): { ok: true } | { ok: false; reason: string } {
  if (course.deletedAt) return { ok: false, reason: "Course not found" };
  if (course.hidden) return { ok: false, reason: "Course is hidden" };
  if (course.status === "archived" || course.status === "draft" || course.status === "scheduled") {
    return { ok: false, reason: "Course is not open for enrollment" };
  }
  if (!course.enrollmentOpen) {
    return { ok: false, reason: "Enrollment is closed for this course" };
  }
  return { ok: true };
}
