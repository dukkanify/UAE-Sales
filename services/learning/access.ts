/**
 * Enrollment access guard — students only see enrolled published content.
 */

import { ROLES } from "@/constants/roles";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { getCourseById, getCourseDetail } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import type { UserProfile } from "@/types";

export class LearningAccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "LearningAccessError";
    this.status = status;
  }
}

export function getActiveEnrollment(studentId: string, courseId: string) {
  return (
    listStudentEnrollments(studentId).find(
      (e) =>
        e.courseId === courseId &&
        ["approved", "completed", "pending"].includes(e.status),
    ) ?? null
  );
}

export function assertStudentEnrolled(user: UserProfile, courseId: string) {
  ensureCoursesSeeded();
  const course = getCourseById(courseId);
  if (!course || course.deletedAt) {
    throw new LearningAccessError("Course not found", 404);
  }

  // Admins may preview learning surfaces without enrollment.
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return (
      getActiveEnrollment(user.id, courseId) ?? {
        id: `preview-${courseId}`,
        courseId,
        studentId: user.id,
        status: "approved" as const,
      }
    );
  }

  if (user.role !== ROLES.STUDENT) {
    throw new LearningAccessError("Learning access is limited to enrolled students");
  }

  const enrollment = getActiveEnrollment(user.id, courseId);
  if (!enrollment) {
    throw new LearningAccessError("You are not enrolled in this course");
  }
  return enrollment;
}

export function getEnrolledCourseDetail(user: UserProfile, courseId: string) {
  assertStudentEnrolled(user, courseId);
  const detail = getCourseDetail(courseId);
  if (!detail) throw new LearningAccessError("Course not found", 404);
  if (user.role === ROLES.STUDENT) {
    return {
      ...detail,
      modules: detail.modules
        .filter((m) => m.visible && m.status !== "hidden")
        .map((m) => ({
          ...m,
          lessons: m.lessons.filter((l) => l.status !== "hidden"),
        })),
    };
  }
  return detail;
}
