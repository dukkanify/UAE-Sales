"use client";

import { ClassManagementView } from "@/features/classes/components/class-management-view";

export default function SuperAdminClassesPage() {
  return <ClassManagementView basePath="/super-admin/classes" roleLabel="Super Admin" />;
}
