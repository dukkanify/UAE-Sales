"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";
import type { Role } from "@/types";

export default function Page() {
  return (
    <UserManagementTable
      title="Students"
      description="Manage student accounts and enrollment readiness."
      roleFilter={"student" as Role | null}
      emptyTitle="No students yet"
      emptyAction={{ label: "Add student", href: "/admin/students" }}
    />
  );
}
