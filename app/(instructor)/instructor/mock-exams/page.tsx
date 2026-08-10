import type { Metadata } from "next";

import { MockExamExaminerView } from "@/features/mock-exams/components/mock-exam-examiner-view";

export const metadata: Metadata = { title: "Mock exams" };

export default function InstructorMockExamsPage() {
  return <MockExamExaminerView />;
}
