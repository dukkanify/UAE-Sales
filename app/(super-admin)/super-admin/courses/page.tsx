"use client";

import { CourseManagementView } from "@/features/courses/components/course-management-view";

export default function SuperAdminCoursesPage() {
  return (
    <CourseManagementView
      basePath="/super-admin/courses"
      roleLabel="Super Admin"
      canManagePublishing
    />
  );
}
