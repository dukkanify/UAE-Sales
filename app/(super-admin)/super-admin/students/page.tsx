"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";
import type { Role } from "@/types";

export default function Page() {
  return (
    <UserManagementTable
      title="Students"
      description="Learners enrolled across Eager Pilots programs."
      roleFilter={"student" as Role | null}
      emptyTitle="No students yet"
      emptyAction={{ label: "Add student", href: "/super-admin/students" }}
    />
  );
}
