/**
 * Chief Ground Instructor / ATPL journey types (CR004).
 */

export type AtplSubjectDistributionStatus = "locked" | "available" | "in_progress" | "completed";

export type AtplLectureDistributionStatus =
  "planned" | "assigned" | "scheduled" | "delivered" | "cancelled";

export interface AtplJourneySettings {
  /** Default first ATPL subject course id when not overridden per student. */
  defaultFirstSubjectCourseId: string | null;
  packageSku: string;
  updatedAt: string;
  updatedById: string | null;
}

/** Ordered subject distribution for a student on the ATPL package. */
export interface AtplSubjectAssignment {
  id: string;
  studentId: string;
  courseId: string;
  subjectCode: string;
  sortOrder: number;
  status: AtplSubjectDistributionStatus;
  assignedInstructorId: string | null;
  unlockedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  assignedById: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Lecture / lesson distribution across instructors. */
export interface AtplLectureAssignment {
  id: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  instructorId: string;
  studentId: string | null;
  status: AtplLectureDistributionStatus;
  scheduledAt: string | null;
  liveClassId: string | null;
  notes: string | null;
  assignedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CgiAuditEvent {
  id: string;
  action: string;
  actorId: string | null;
  entityType: string;
  entityId: string | null;
  detail: string;
  createdAt: string;
}

export interface CgiOversightNote {
  id: string;
  targetType: "student" | "instructor";
  targetUserId: string;
  body: string;
  authorId: string;
  createdAt: string;
}
