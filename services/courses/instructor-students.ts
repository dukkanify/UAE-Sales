import { generateId } from "@/lib/security/crypto";
import { readAuthDb } from "@/services/auth/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";

export type InstructorStudentRow = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
};

/** Students enrolled in courses assigned to this instructor. */
export function listInstructorStudents(instructorUserId: string): InstructorStudentRow[] {
  ensureCoursesSeeded();
  const coursesDb = readCoursesDb();
  const courseIds = new Set(
    coursesDb.instructors
      .filter((row) => row.userId === instructorUserId)
      .map((row) => row.courseId),
  );
  // Also include courses where primaryInstructorId matches
  for (const course of coursesDb.courses) {
    if (!course.deletedAt && course.primaryInstructorId === instructorUserId) {
      courseIds.add(course.id);
    }
  }

  const authUsers = readAuthDb().users;
  const courseTitle = (id: string) => coursesDb.courses.find((c) => c.id === id)?.title ?? "Course";

  return coursesDb.enrollments
    .filter((e) => courseIds.has(e.courseId) && !["dropped", "rejected"].includes(e.status))
    .map((e) => {
      const student = authUsers.find((u) => u.id === e.studentId);
      const name = student
        ? [student.firstName, student.lastName].filter(Boolean).join(" ").trim() || student.email
        : "Unknown student";
      return {
        id: e.id || generateId(),
        studentId: e.studentId,
        studentName: name,
        studentEmail: student?.email ?? "",
        courseId: e.courseId,
        courseTitle: courseTitle(e.courseId),
        status: e.status,
        progressPercent: 0,
        enrolledAt: e.enrolledAt,
      };
    })
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
}
