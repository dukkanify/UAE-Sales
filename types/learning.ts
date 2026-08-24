/**
 * Student Learning Journey domain types.
 */

export type BookmarkTargetType = "lesson" | "resource" | "video" | "section";

export type FavoriteTargetType = "course" | "lesson" | "resource";

export type LearningActivityType =
  | "course_started"
  | "lesson_started"
  | "lesson_completed"
  | "video_watched"
  | "resource_downloaded"
  | "note_created"
  | "bookmark_added"
  | "goal_completed"
  | "study_session"
  | "login";

export type StudyGoalPeriod = "weekly" | "monthly";

export type StudyGoalStatus = "active" | "completed" | "abandoned";

export interface LessonProgressRecord {
  id: string;
  studentId: string;
  enrollmentId: string;
  courseId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt: string | null;
  timeSpentSeconds: number;
  /** Resume position for video/content scroll (seconds or %) */
  resumePosition: number;
  lastAccessedAt: string | null;
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLearningState {
  studentId: string;
  courseId: string;
  enrollmentId: string;
  lastLessonId: string | null;
  lastModuleId: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  timeSpentSeconds: number;
  bookmarked: boolean;
  favorited: boolean;
  startedAt: string | null;
  lastAccessedAt: string | null;
  completedAt: string | null;
}

export interface StudentNote {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  studentId: string;
  targetType: BookmarkTargetType;
  targetId: string;
  courseId: string | null;
  lessonId: string | null;
  label: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Favorite {
  id: string;
  studentId: string;
  targetType: FavoriteTargetType;
  targetId: string;
  courseId: string | null;
  label: string;
  createdAt: string;
}

export interface LearningHistoryEvent {
  id: string;
  studentId: string;
  type: LearningActivityType;
  title: string;
  description: string;
  courseId: string | null;
  lessonId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface StudySession {
  id: string;
  studentId: string;
  title: string;
  courseId: string | null;
  lessonId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  completed: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  studentId: string;
  title: string;
  period: StudyGoalPeriod;
  targetHours: number;
  completedHours: number;
  status: StudyGoalStatus;
  startsAt: string;
  endsAt: string;
  /** Reserved for future AI recommendations */
  aiSuggested: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Offline-ready cache metadata (no binary payloads) */
export interface OfflineCacheEntry {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  cachedAt: string;
  contentVersion: string;
  sizeBytes: number | null;
  syncedAt: string | null;
}

export interface LearningDashboardOverview {
  activeCourses: number;
  completedCourses: number;
  upcomingLiveClass: string | null;
  upcomingLiveClassId: string | null;
  learningHours: number;
  progressPercent: number;
  assignments: number;
  notifications: number;
  resume: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
  } | null;
  recentActivity: LearningHistoryEvent[];
  weeklyGoalPercent: number;
}

export interface ResourceLibraryItem {
  id: string;
  title: string;
  type: string;
  url: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  downloadable: boolean;
  fileName: string | null;
}

export type LearningCalendarItem = {
  id: string;
  title: string;
  type: "live_class" | "study_session" | "deadline" | "lesson";
  startsAt: string;
  endsAt: string | null;
  status: "upcoming" | "completed" | "past";
  href: string | null;
  courseId: string | null;
};
