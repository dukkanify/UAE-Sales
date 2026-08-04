/**
 * LMS / Course Management domain types.
 * Runtime store: .data/aep-courses.json — SQL/Prisma mirrors production shape.
 */

export type CourseStatus = "draft" | "published" | "private" | "scheduled" | "archived";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type EnrollmentMode = "open" | "private" | "invitation" | "manual";

export type EnrollmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "dropped"
  | "suspended";

export type ContentStatus = "draft" | "published" | "hidden";

export type ResourceType =
  | "pdf"
  | "ppt"
  | "doc"
  | "image"
  | "audio"
  | "link"
  | "zip"
  | "video";

export type InstructorRole = "primary" | "assistant";

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  icon: string;
  order: number;
  visible: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CourseInstructorAssignment {
  id: string;
  courseId: string;
  userId: string;
  role: InstructorRole;
  assignedAt: string;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  type: ResourceType;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  downloadable: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  contentHtml: string;
  videoUrl: string | null;
  durationMinutes: number;
  estimatedStudyMinutes: number;
  order: number;
  previewAvailable: boolean;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDurationMinutes: number;
  status: ContentStatus;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  code: string;
  categoryId: string | null;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  previewVideoUrl: string | null;
  difficulty: DifficultyLevel;
  language: string;
  estimatedDurationMinutes: number;
  enrollmentMode: EnrollmentMode;
  status: CourseStatus;
  scheduledPublishAt: string | null;
  primaryInstructorId: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
}

/** Aggregated counts for list/detail responses */
export interface CourseCounts {
  modules: number;
  lessons: number;
  resources: number;
  enrollments: number;
  activeEnrollments: number;
}

export interface CourseListItem extends Course {
  categoryName: string | null;
  primaryInstructorName: string | null;
  counts: CourseCounts;
}

export interface CourseDetail extends CourseListItem {
  modules: Array<CourseModule & { lessons: Array<Lesson & { resources: LessonResource[] }> }>;
  instructors: CourseInstructorAssignment[];
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
  enrolledById: string | null;
  enrolledAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  droppedAt: string | null;
  suspendedAt: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface EnrollmentWithStudent extends Enrollment {
  studentName: string | null;
  studentEmail: string | null;
}

/**
 * Progress foundation — business logic later.
 * Fields reserved for completion tracking.
 */
export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  courseId: string;
  studentId: string;
  completed: boolean;
  completedAt: string | null;
  timeSpentSeconds: number;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgressSummary {
  enrollmentId: string;
  courseId: string;
  studentId: string;
  completedLessons: number;
  remainingLessons: number;
  totalLessons: number;
  progressPercent: number;
  timeSpentSeconds: number;
  lastAccessedAt: string | null;
  completionStatus: "not_started" | "in_progress" | "completed";
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  privateCourses: number;
  scheduledCourses: number;
  totalCategories: number;
  activeStudents: number;
  totalEnrollments: number;
  recentlyUpdated: CourseListItem[];
}

export interface CourseFilters {
  q?: string;
  instructorId?: string;
  categoryId?: string;
  status?: CourseStatus | "all";
  difficulty?: DifficultyLevel | "all";
  enrollmentMode?: EnrollmentMode | "all";
  code?: string;
  publishedFrom?: string;
  publishedTo?: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "title" | "code" | "updatedAt" | "createdAt" | "status";
  sortDir?: "asc" | "desc";
}

export type BulkCourseAction =
  | "publish"
  | "archive"
  | "delete"
  | "assign_instructor"
  | "change_category"
  | "export";
