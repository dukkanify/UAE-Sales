"use client";

import { use } from "react";

import { ClassDetailView } from "@/features/classes/components/class-detail-view";

export default function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ClassDetailView classId={id} basePath="/admin/classes" roleLabel="Admin" />;
}
