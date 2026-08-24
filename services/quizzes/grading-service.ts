/**
 * Auto-grading + score helpers (SOLID: GradingService).
 */

import { AUTO_GRADEABLE_TYPES, MANUAL_GRADE_TYPES } from "@/constants/quizzes";
import type { BankQuestion, QuestionType } from "@/types/quizzes";

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value == null) return [];
  return [String(value)];
}

function sortedJoin(values: string[]): string {
  return [...values].map(normalizeText).sort().join("|");
}

export function needsManualGrading(type: QuestionType): boolean {
  return MANUAL_GRADE_TYPES.includes(type);
}

export function isAutoGradeable(type: QuestionType): boolean {
  return AUTO_GRADEABLE_TYPES.includes(type);
}

/**
 * Returns { correct, score } where score is 0..points (before negative marking).
 */
export function autoGradeResponse(
  question: BankQuestion,
  response: unknown,
  points: number,
): { isCorrect: boolean | null; score: number | null; needsManual: boolean } {
  if (needsManualGrading(question.type)) {
    return { isCorrect: null, score: null, needsManual: true };
  }

  const correct = question.correctAnswer;
  let ok = false;

  switch (question.type) {
    case "multiple_choice_single":
    case "true_false":
      ok = normalizeText(response) === normalizeText(correct);
      break;
    case "multiple_choice_multiple":
      ok = sortedJoin(asStringArray(response)) === sortedJoin(asStringArray(correct));
      break;
    case "fill_blank": {
      const accepted = asStringArray(correct).map(normalizeText);
      ok = accepted.includes(normalizeText(response));
      break;
    }
    case "matching": {
      const resp = (response ?? {}) as Record<string, string>;
      const exp = (correct ?? {}) as Record<string, string>;
      const keys = Object.keys(exp);
      ok =
        keys.length > 0 &&
        keys.every((k) => normalizeText(resp[k]) === normalizeText(exp[k]));
      break;
    }
    case "ordering":
      ok =
        JSON.stringify(asStringArray(response).map(normalizeText)) ===
        JSON.stringify(asStringArray(correct).map(normalizeText));
      break;
    default:
      return { isCorrect: null, score: null, needsManual: true };
  }

  return {
    isCorrect: ok,
    score: ok ? points : 0,
    needsManual: false,
  };
}

export function applyNegativeMarking(
  isCorrect: boolean | null,
  score: number | null,
  points: number,
  enabled: boolean,
  penalty: number,
): number {
  if (score == null) return 0;
  if (isCorrect === false && enabled) {
    return -Math.abs(penalty || 0);
  }
  if (isCorrect === true) return points;
  return score;
}
