"use client";

import { CourseCatalogView } from "@/features/courses/components/course-catalog-view";

export default function StudentCoursesPage() {
  return (
    <CourseCatalogView
      title="My courses"
      description="Programs you are enrolled in."
      roleLabel="Student"
      mode="student"
    />
  );
}
