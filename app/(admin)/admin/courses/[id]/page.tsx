"use client";

import { use } from "react";

import { CourseDetailView } from "@/features/courses/components/course-detail-view";

export default function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CourseDetailView courseId={id} basePath="/admin/courses" roleLabel="Admin" />;
}
