/**
 * Assessment / Quiz Engine domain types.
 * Runtime: .data/aep-quizzes.json — SQL mirror in 008_assessment_quizzes.sql
 * Future: PILOT100 / external bank adapters via ImportService.
 */

export type QuestionType =
  | "multiple_choice_single"
  | "multiple_choice_multiple"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "essay"
  | "matching"
  | "ordering";

export type QuestionDifficulty = "easy" | "medium" | "hard" | "expert";

export type QuizStatus = "draft" | "published" | "archived";

export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "graded"
  | "abandoned"
  | "expired";

export type GradeStatus = "pending" | "auto_graded" | "needs_review" | "final";

/** Extensible option / prompt payload per question type */
export interface QuestionOption {
  id: string;
  label: string;
  /** For matching: pair key; for ordering: sequence index is order field */
  meta?: Record<string, unknown>;
  order: number;
}

export interface QuestionBankCategory {
  id: string;
  name: string;
  slug: string;
  subject: string;
  moduleLabel: string;
  parentId: string | null;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankQuestion {
  id: string;
  stem: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  categoryId: string | null;
  subject: string;
  moduleLabel: string;
  tags: string[];
  options: QuestionOption[];
  /** Canonical correct answer payload (type-specific) */
  correctAnswer: unknown;
  explanation: string;
  points: number;
  /** External bank id e.g. PILOT100 */
  externalId: string | null;
  externalSource: string | null;
  metadata: Record<string, unknown>;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string | null;
  moduleId: string | null;
  lessonId: string | null;
  status: QuizStatus;
  passingScore: number;
  totalMarks: number;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  randomQuestions: boolean;
  randomAnswers: boolean;
  negativeMarking: boolean;
  negativeMarkValue: number;
  showResultsImmediately: boolean;
  reviewAnswers: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  /** Exam rules */
  autoSubmitOnExpiry: boolean;
  allowResume: boolean;
  preventDuplicateAttempts: boolean;
  questionCount: number | null;
  instructions: string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  archivedAt: string | null;
  publishedAt: string | null;
}

export interface QuizQuestionLink {
  id: string;
  quizId: string;
  questionId: string;
  order: number;
  pointsOverride: number | null;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  expiresAt: string | null;
  timeSpentSeconds: number;
  score: number | null;
  maxScore: number;
  percent: number | null;
  passed: boolean | null;
  gradeStatus: GradeStatus;
  /** Snapshot of question ids served (supports random) */
  questionIds: string[];
  lastSavedAt: string | null;
  clientMeta: Record<string, unknown>;
  suspiciousEvents: Array<{ at: string; type: string; detail: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  response: unknown;
  isCorrect: boolean | null;
  autoScore: number | null;
  manualScore: number | null;
  finalScore: number | null;
  needsManualGrading: boolean;
  feedback: string;
  gradedById: string | null;
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorReview {
  id: string;
  attemptId: string;
  instructorId: string;
  comments: string;
  scoreAdjustment: number;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAnalyticsSnapshot {
  quizId: string;
  attemptsCount: number;
  completedCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  failureRate: number;
  averageTimeSeconds: number;
  questionStats: Array<{
    questionId: string;
    stem: string;
    attempts: number;
    correctRate: number;
    avgScore: number;
  }>;
  frequentlyMissed: Array<{ questionId: string; stem: string; missRate: number }>;
}

export interface QuizListItem extends Quiz {
  courseTitle: string | null;
  questionLinks: number;
  attemptsCount: number;
}

export interface QuizFilters {
  q?: string;
  status?: QuizStatus | "all";
  courseId?: string;
  page?: number;
  pageSize?: number;
}

export interface QuestionFilters {
  q?: string;
  type?: QuestionType | "all";
  difficulty?: QuestionDifficulty | "all";
  categoryId?: string;
  subject?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}
