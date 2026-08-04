"use client";

import { use } from "react";

import { ClassDetailView } from "@/features/classes/components/class-detail-view";

export default function InstructorClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ClassDetailView classId={id} basePath="/instructor/classes" roleLabel="Instructor" />
  );
}
