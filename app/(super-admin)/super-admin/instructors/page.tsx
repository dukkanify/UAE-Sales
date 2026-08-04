"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";
import type { Role } from "@/types";

export default function Page() {
  return (
    <UserManagementTable
      title="Instructors"
      description="Certified instructors delivering aviation programs."
      roleFilter={"instructor" as Role | null}
      emptyTitle="No instructors yet"
      emptyAction={{ label: "Create instructor", href: "/super-admin/instructors" }}
    />
  );
}
