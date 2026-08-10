/**
 * Post-lecture student performance reports (CR006).
 * Sourced from the student evaluation form.
 */

export type PerformanceRating =
  "excellent" | "good" | "satisfactory" | "needs_improvement" | "unsatisfactory";

export interface PerformanceReport {
  id: string;
  liveClassId: string;
  classTitle: string;
  courseId: string | null;
  courseCode: string | null;
  studentId: string;
  instructorId: string;
  /** Today's Topic */
  todaysTopic: string;
  /** Next Topic */
  nextTopic: string;
  homework: string;
  performance: PerformanceRating;
  /** Question bank references / practice set notes */
  questionBank: string;
  comments: string;
  emailSentAt: string | null;
  emailOutboxId: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReportWithNames extends PerformanceReport {
  studentName: string | null;
  studentEmail: string | null;
  instructorName: string | null;
}

export interface CreatePerformanceReportInput {
  liveClassId: string;
  studentId: string;
  todaysTopic: string;
  nextTopic: string;
  homework: string;
  performance: PerformanceRating;
  questionBank: string;
  comments: string;
  actorId: string;
  sendEmail?: boolean;
}
