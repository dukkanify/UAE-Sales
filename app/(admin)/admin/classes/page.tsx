"use client";

import { ClassManagementView } from "@/features/classes/components/class-management-view";

export default function AdminClassesPage() {
  return <ClassManagementView basePath="/admin/classes" roleLabel="Admin" />;
}
