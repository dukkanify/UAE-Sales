import type { Metadata } from "next";

import { MockExamBookingView } from "@/features/mock-exams/components/mock-exam-booking-view";

export const metadata: Metadata = { title: "Mock exams" };

export default function StudentMockExamsPage() {
  return <MockExamBookingView />;
}
