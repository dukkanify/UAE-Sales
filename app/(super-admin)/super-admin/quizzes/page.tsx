"use client";

import { InstructorQuizzesView } from "@/features/quizzes";

export default function SuperAdminQuizzesPage() {
  return <InstructorQuizzesView roleLabel="Super Admin" basePath="/super-admin/quizzes" />;
}
