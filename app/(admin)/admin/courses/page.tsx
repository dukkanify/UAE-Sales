"use client";

import { CourseManagementView } from "@/features/courses/components/course-management-view";

export default function AdminCoursesPage() {
  return <CourseManagementView basePath="/admin/courses" roleLabel="Admin" />;
}
