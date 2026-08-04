/**
 * AI Learning Assistant domain types.
 */

export type AiAssistantPersona = "student" | "instructor" | "admin";

export type AiMessageRole = "user" | "assistant" | "system";

export type AiIntent =
  | "chat"
  | "explain"
  | "summarize"
  | "study_tips"
  | "recommend"
  | "practice_questions"
  | "exam_prep"
  | "lesson_objectives"
  | "assignment"
  | "quiz"
  | "announcement"
  | "email"
  | "writing"
  | "report"
  | "insights"
  | "search"
  | "study_plan"
  | "notification"
  | "unknown";

export type AiDifficulty = "easy" | "medium" | "hard";

export type AiPlanHorizon = "daily" | "weekly" | "monthly" | "revision" | "exam";

export type AiContentKind =
  | "lesson"
  | "module"
  | "course"
  | "pdf"
  | "announcement"
  | "blog"
  | "notes"
  | "generic";

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  intent: AiIntent | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  persona: AiAssistantPersona;
  title: string;
  contextCourseId: string | null;
  contextLessonId: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiUsageRecord {
  id: string;
  userId: string;
  persona: AiAssistantPersona;
  action: string;
  tokensIn: number;
  tokensOut: number;
  conversationId: string | null;
  createdAt: string;
}

export interface AiFeedback {
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  rating: "up" | "down";
  comment: string;
  createdAt: string;
}

export interface AiPromptTemplate {
  id: string;
  key: string;
  persona: AiAssistantPersona | "all";
  title: string;
  prompt: string;
  intent: AiIntent;
  active: boolean;
}

export interface AiRecommendation {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  reason: string;
  score: number;
  categoryId: string | null;
  createdAt: string;
}

export interface AiStudyPlanItem {
  id: string;
  title: string;
  courseId: string | null;
  lessonId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string;
}

export interface AiStudyPlan {
  id: string;
  studentId: string;
  horizon: AiPlanHorizon;
  title: string;
  summary: string;
  items: AiStudyPlanItem[];
  editable: boolean;
  accepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiLogEntry {
  id: string;
  userId: string;
  persona: AiAssistantPersona;
  action: string;
  safe: boolean;
  blockedReason: string | null;
  inputPreview: string;
  outputPreview: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AiGeneratedQuestion {
  id: string;
  type: "mcq" | "true_false" | "essay" | "flashcard";
  difficulty: AiDifficulty;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface AiInsight {
  id: string;
  kind: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  metric?: number | string;
}

export interface AiSearchResult {
  type: string;
  id: string;
  title: string;
  href: string;
  snippet: string;
}

export interface AiUserContext {
  persona: AiAssistantPersona;
  enrolledCourses: Array<{ id: string; title: string; code: string; progress: number }>;
  recentLessons: Array<{ id: string; title: string; courseId: string }>;
  quizAvg: number;
  goals: string[];
  liveUpcoming: number;
  roleLabel: string;
}
