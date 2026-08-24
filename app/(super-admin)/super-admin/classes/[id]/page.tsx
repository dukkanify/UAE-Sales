"use client";

import { use } from "react";

import { ClassDetailView } from "@/features/classes/components/class-detail-view";

export default function SuperAdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ClassDetailView classId={id} basePath="/super-admin/classes" roleLabel="Super Admin" />
  );
}
