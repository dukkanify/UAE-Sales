"use client";

import { use } from "react";

import { CourseDetailView } from "@/features/courses/components/course-detail-view";

export default function SuperAdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <CourseDetailView
      courseId={id}
      basePath="/super-admin/courses"
      roleLabel="Super Admin"
      canManagePublishing
    />
  );
}
