"use client";

import * as React from "react";

import { CourseCatalogView } from "@/features/courses/components/course-catalog-view";
import { authFetch } from "@/features/auth/services/auth-api";
import type { UserProfile } from "@/types";

export default function InstructorCoursesPage() {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    void authFetch<{ user: UserProfile }>("/api/auth/me").then((res) => {
      setUserId(res.data?.user?.id ?? null);
    });
  }, []);

  return (
    <CourseCatalogView
      title="My courses"
      description="Courses assigned to you as primary or assistant instructor."
      roleLabel="Instructor"
      mode="instructor"
      instructorId={userId}
    />
  );
}
