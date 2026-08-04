"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";
import type { Role } from "@/types";

export default function Page() {
  return (
    <UserManagementTable
      title="Admins"
      description="Platform administrators with operational access."
      roleFilter={"admin" as Role | null}
      emptyTitle="No admins yet"
      emptyAction={{ label: "Create admin", href: "/super-admin/admins" }}
    />
  );
}
