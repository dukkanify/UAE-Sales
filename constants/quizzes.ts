/**
 * Assessment / quiz constants.
 */

import type { QuestionDifficulty, QuestionType, QuizStatus } from "@/types/quizzes";

export const QUESTION_TYPES: QuestionType[] = [
  "multiple_choice_single",
  "multiple_choice_multiple",
  "true_false",
  "fill_blank",
  "short_answer",
  "essay",
  "matching",
  "ordering",
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice_single: "Multiple choice (single)",
  multiple_choice_multiple: "Multiple choice (multiple)",
  true_false: "True / False",
  fill_blank: "Fill in the blank",
  short_answer: "Short answer",
  essay: "Essay",
  matching: "Matching",
  ordering: "Ordering / Sequence",
};

export const AUTO_GRADEABLE_TYPES: QuestionType[] = [
  "multiple_choice_single",
  "multiple_choice_multiple",
  "true_false",
  "fill_blank",
  "matching",
  "ordering",
];

export const MANUAL_GRADE_TYPES: QuestionType[] = ["short_answer", "essay"];

export const QUESTION_DIFFICULTIES: QuestionDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
];

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
};

export const QUIZ_STATUSES: QuizStatus[] = ["draft", "published", "archived"];

export const QUIZ_STATUS_LABELS: Record<QuizStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const DEFAULT_QUIZ_PAGE_SIZE = 20;
export const DEFAULT_QUESTION_PAGE_SIZE = 25;
export const MAX_AUTO_SAVE_PAYLOAD_KB = 256;

/** PILOT100 / external bank adapter id placeholder */
export const EXTERNAL_BANK_PILOT100 = "pilot100";
