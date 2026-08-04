"use client";

import { InstructorQuizzesView } from "@/features/quizzes";

export default function AdminQuizzesPage() {
  return <InstructorQuizzesView roleLabel="Admin" basePath="/admin/quizzes" />;
}
