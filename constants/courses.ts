/**
 * Course / LMS constants — labels and option lists.
 */

import type {
  ContentStatus,
  CourseStatus,
  DifficultyLevel,
  EnrollmentMode,
  EnrollmentStatus,
  ResourceType,
} from "@/types/courses";

export const COURSE_STATUSES: CourseStatus[] = [
  "draft",
  "published",
  "private",
  "scheduled",
  "archived",
];

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: "Draft",
  published: "Published",
  private: "Private",
  scheduled: "Scheduled",
  archived: "Archived",
};

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export const ENROLLMENT_MODES: EnrollmentMode[] = [
  "open",
  "private",
  "invitation",
  "manual",
];

export const ENROLLMENT_MODE_LABELS: Record<EnrollmentMode, string> = {
  open: "Open enrollment",
  private: "Private enrollment",
  invitation: "Invitation only",
  manual: "Manual enrollment",
};

export const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  "pending",
  "approved",
  "rejected",
  "completed",
  "dropped",
  "suspended",
];

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
  dropped: "Dropped",
  suspended: "Suspended",
};

export const CONTENT_STATUSES: ContentStatus[] = ["draft", "published", "hidden"];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

export const RESOURCE_TYPES: ResourceType[] = [
  "pdf",
  "ppt",
  "doc",
  "image",
  "audio",
  "link",
  "zip",
  "video",
];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  pdf: "PDF",
  ppt: "PowerPoint",
  doc: "Word",
  image: "Image",
  audio: "Audio",
  link: "External link",
  zip: "ZIP archive",
  video: "Video",
};

export const COURSE_LANGUAGES = [
  { value: "en", label: "English" },
] as const;

/** Soft-delete retention note — records kept with deletedAt set */
export const COURSE_SOFT_DELETE = true;

export const DEFAULT_COURSE_PAGE_SIZE = 12;

export const MAX_COURSE_CODE_LENGTH = 32;
export const MAX_COURSE_TITLE_LENGTH = 160;
