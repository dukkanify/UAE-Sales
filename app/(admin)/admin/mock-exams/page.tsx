import type { Metadata } from "next";

import { MockExamAdminView } from "@/features/mock-exams/components/mock-exam-admin-view";

export const metadata: Metadata = { title: "Mock exams" };

export default function AdminMockExamsPage() {
  return <MockExamAdminView roleLabel="Admin" />;
}
