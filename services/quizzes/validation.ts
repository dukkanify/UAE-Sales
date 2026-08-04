/**
 * Quiz / question validation helpers.
 */

import { QUESTION_TYPES, QUESTION_DIFFICULTIES } from "@/constants/quizzes";
import type { QuestionDifficulty, QuestionType } from "@/types/quizzes";

export class QuizValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "QuizValidationError";
    this.status = status;
  }
}

export function assertQuestionType(value: unknown): QuestionType {
  if (typeof value !== "string" || !QUESTION_TYPES.includes(value as QuestionType)) {
    throw new QuizValidationError("Invalid question type");
  }
  return value as QuestionType;
}

export function assertDifficulty(value: unknown): QuestionDifficulty {
  if (
    typeof value !== "string" ||
    !QUESTION_DIFFICULTIES.includes(value as QuestionDifficulty)
  ) {
    throw new QuizValidationError("Invalid difficulty");
  }
  return value as QuestionDifficulty;
}

export function requireNonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new QuizValidationError(`${label} is required`);
  }
  return value.trim();
}
