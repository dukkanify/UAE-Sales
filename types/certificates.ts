/**
 * Certificates, academic progress, and reporting domain types.
 * Runtime: .data/aep-certificates.json — SQL: 009_certificates_reports.sql
 */

export type CertificateStatus =
  | "draft"
  | "pending_approval"
  | "issued"
  | "revoked"
  | "expired"
  | "reissued";

export type CertificateIssueMode = "automatic" | "manual";

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  logoUrl: string | null;
  backgroundUrl: string | null;
  primaryColor: string;
  accentColor: string;
  signatureName: string;
  signatureTitle: string;
  signatureImageUrl: string | null;
  bodyHtml: string;
  /** Dynamic field placeholders supported in bodyHtml */
  fields: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  studentId: string;
  studentName: string;
  courseId: string | null;
  courseName: string;
  instructorId: string | null;
  instructorName: string;
  templateId: string;
  status: CertificateStatus;
  issueMode: CertificateIssueMode;
  completionDate: string;
  issueDate: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  reissuedFromId: string | null;
  digitalSignature: string;
  qrPayload: string;
  approvedById: string | null;
  approvedAt: string | null;
  metadata: Record<string, unknown>;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompletionRecord {
  id: string;
  studentId: string;
  courseId: string;
  completedAt: string;
  progressPercent: number;
  learningHours: number;
  certificateId: string | null;
  createdAt: string;
}

export interface StudentProgressSnapshot {
  studentId: string;
  overallPercent: number;
  activeCourses: number;
  completedCourses: number;
  learningHours: number;
  lessonsCompleted: number;
  lessonsStarted: number;
  studyStreakDays: number;
  attendanceRate: number;
  averageQuizScore: number;
  quizAttempts: number;
  quizPassRate: number;
  liveClassParticipation: number;
  certificatesIssued: number;
  courseProgress: Array<{
    courseId: string;
    courseTitle: string;
    percent: number;
    completedLessons: number;
    totalLessons: number;
    timeSpentSeconds: number;
    completedAt: string | null;
  }>;
}

export interface AcademicPerformance {
  studentId: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  attendanceRate: number;
  completionRate: number;
  studyTimeHours: number;
  quizAttempts: number;
  liveClassParticipation: number;
}

export interface ProgressTimelineEvent {
  id: string;
  at: string;
  type:
    | "enrollment"
    | "course_started"
    | "module_completed"
    | "lesson_completed"
    | "quiz_passed"
    | "certificate_issued"
    | "activity";
  title: string;
  description: string;
  courseId: string | null;
}

export interface TranscriptCourseRow {
  courseId: string;
  courseTitle: string;
  code: string;
  progressPercent: number;
  completed: boolean;
  completedAt: string | null;
  learningHours: number;
  quizAverage: number | null;
  certificateNumber: string | null;
}

export interface StudentTranscript {
  studentId: string;
  studentName: string;
  studentEmail: string;
  generatedAt: string;
  overallPerformance: number;
  learningHours: number;
  attendanceRate: number;
  courses: TranscriptCourseRow[];
  certificates: Array<{
    certificateNumber: string;
    courseName: string;
    issueDate: string | null;
    status: CertificateStatus;
  }>;
  quizSummary: {
    attempts: number;
    averagePercent: number;
    passRate: number;
  };
  instructorEvaluations: Array<{
    courseName: string;
    comment: string;
    at: string;
  }>;
}

export interface InstructorReportBundle {
  instructorId: string;
  studentsTracked: number;
  coursesOwned: number;
  averageStudentProgress: number;
  attendanceRate: number;
  courseCompletionRate: number;
  quizAverage: number;
  certificatesIssued: number;
  studentRows: Array<{
    studentId: string;
    studentName: string;
    progressPercent: number;
    quizAverage: number;
    certificates: number;
    lastActivityAt: string | null;
  }>;
}

export interface AdminReportBundle {
  students: number;
  instructors: number;
  courses: number;
  liveClasses: number;
  certificatesIssued: number;
  certificatesPending: number;
  averageAttendance: number;
  averageCompletion: number;
  quizPassRate: number;
  platformActiveUsers: number;
}

export interface ExecutiveReportBundle {
  totalGraduates: number;
  certificatesIssued: number;
  activeStudents: number;
  completionTrend: Array<{ month: string; completions: number }>;
  courseSuccessRate: number;
  instructorPerformance: Array<{
    instructorId: string;
    instructorName: string;
    students: number;
    avgProgress: number;
    certificates: number;
  }>;
  monthlyGrowth: Array<{ month: string; students: number; certificates: number }>;
  platformEngagement: {
    learningHours: number;
    quizAttempts: number;
    liveAttendance: number;
  };
}

export interface PublicVerificationResult {
  valid: boolean;
  certificateNumber: string | null;
  studentName: string | null;
  courseName: string | null;
  issueDate: string | null;
  status: CertificateStatus | null;
  validity: "valid" | "revoked" | "expired" | "pending" | "not_found";
  organizationName: string;
  instructorName: string | null;
}
