"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";
import type { Role } from "@/types";

export default function Page() {
  return (
    <UserManagementTable
      title="Instructors"
      description="Approve and support instructor accounts."
      roleFilter={"instructor" as Role | null}
      emptyTitle="No instructors yet"
      emptyAction={{ label: "Add instructor", href: "/admin/instructors" }}
    />
  );
}
