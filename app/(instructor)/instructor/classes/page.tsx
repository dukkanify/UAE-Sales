"use client";

import * as React from "react";

import { ClassManagementView } from "@/features/classes/components/class-management-view";
import { authFetch } from "@/features/auth/services/auth-api";
import type { UserProfile } from "@/types";

export default function InstructorClassesPage() {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    void authFetch<{ user: UserProfile }>("/api/auth/me").then((res) => {
      setUserId(res.data?.user?.id ?? null);
    });
  }, []);

  if (!userId) return null;

  return (
    <ClassManagementView
      basePath="/instructor/classes"
      roleLabel="Instructor"
      lockInstructorId={userId}
    />
  );
}
