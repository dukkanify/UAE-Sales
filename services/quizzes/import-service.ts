/**
 * Question import — CSV / Excel-ready JSON / API / future PILOT100 adapter.
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { EXTERNAL_BANK_PILOT100, QUESTION_TYPES } from "@/constants/quizzes";
import { logActivity } from "@/services/auth/activity-log";
import { assertCanManageQuizzes } from "@/services/quizzes/access";
import { createQuestion } from "@/services/quizzes/question-bank-service";
import { QuizValidationError } from "@/services/quizzes/validation";
import type { BankQuestion, QuestionType } from "@/types/quizzes";
import type { UserProfile } from "@/types";

export interface ImportQuestionRow {
  stem: string;
  type: QuestionType;
  difficulty?: string;
  subject?: string;
  moduleLabel?: string;
  tags?: string;
  options?: string;
  correctAnswer?: string;
  explanation?: string;
  points?: number | string;
  externalId?: string;
  externalSource?: string;
}

function parseOptions(raw?: string) {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ id?: string; label: string; order?: number }>;
    return parsed.map((o, i) => ({
      id: o.id ?? `opt_${i + 1}`,
      label: o.label,
      order: o.order ?? i + 1,
    }));
  } catch {
    return raw.split("|").map((label, i) => ({
      id: `opt_${i + 1}`,
      label: label.trim(),
      order: i + 1,
    }));
  }
}

function parseCorrect(raw: string | undefined, type: QuestionType): unknown {
  if (raw == null || raw === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    if (type === "multiple_choice_multiple" || type === "ordering") {
      return raw.split("|").map((s) => s.trim());
    }
    return raw;
  }
}

/** Parse simple CSV (comma-separated, quoted fields supported lightly). */
export function parseCsvQuestions(csv: string): ImportQuestionRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]!).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return {
      stem: row.stem ?? row.question ?? "",
      type: (row.type as QuestionType) || "multiple_choice_single",
      difficulty: row.difficulty,
      subject: row.subject,
      moduleLabel: row.module ?? row.modulelabel,
      tags: row.tags,
      options: row.options,
      correctAnswer: row.correct ?? row.correctanswer,
      explanation: row.explanation,
      points: row.points,
      externalId: row.externalid ?? row.external_id,
      externalSource: row.externalsource ?? row.source,
    };
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * Excel import expects pre-parsed rows (client/SheetJS or server xlsx later).
 * Same shape as CSV rows / API JSON array.
 */
export async function importQuestionRows(input: {
  user: UserProfile;
  rows: ImportQuestionRow[];
  source?: string;
}): Promise<{ imported: number; questions: BankQuestion[]; errors: string[] }> {
  assertCanManageQuizzes(input.user);
  const errors: string[] = [];
  const questions: BankQuestion[] = [];

  for (let i = 0; i < input.rows.length; i += 1) {
    const row = input.rows[i]!;
    try {
      if (!row.stem?.trim()) throw new QuizValidationError("Missing stem");
      if (!QUESTION_TYPES.includes(row.type)) {
        throw new QuizValidationError(`Invalid type: ${row.type}`);
      }
      const created = await createQuestion({
        user: input.user,
        stem: row.stem,
        type: row.type,
        difficulty: row.difficulty ?? "medium",
        subject: row.subject,
        moduleLabel: row.moduleLabel,
        tags: row.tags
          ? row.tags.split(/[|,]/).map((t) => t.trim()).filter(Boolean)
          : [],
        options: parseOptions(row.options),
        correctAnswer: parseCorrect(row.correctAnswer, row.type),
        explanation: row.explanation,
        points: Number(row.points ?? 1) || 1,
        externalId: row.externalId ?? null,
        externalSource: row.externalSource ?? input.source ?? null,
        metadata: { importBatch: true },
      });
      questions.push(created);
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Failed"}`);
    }
  }

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.QUESTION_IMPORTED,
    entityType: "question_bank",
    entityId: "import",
    metadata: {
      imported: questions.length,
      errors: errors.length,
      source: input.source ?? "api",
    },
  });

  return { imported: questions.length, questions, errors };
}

/** Future PILOT100 adapter — normalizes external payload into import rows. */
export function mapPilot100Payload(payload: unknown): ImportQuestionRow[] {
  if (!Array.isArray(payload)) {
    throw new QuizValidationError("PILOT100 payload must be an array");
  }
  return payload.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      stem: String(row.questionText ?? row.stem ?? ""),
      type: (row.questionType as QuestionType) || "multiple_choice_single",
      difficulty: String(row.difficulty ?? "medium"),
      subject: String(row.subject ?? "ATPL"),
      moduleLabel: String(row.module ?? ""),
      tags: Array.isArray(row.tags) ? row.tags.join("|") : String(row.tags ?? ""),
      options: JSON.stringify(row.options ?? []),
      correctAnswer:
        typeof row.correctAnswer === "string"
          ? row.correctAnswer
          : JSON.stringify(row.correctAnswer ?? null),
      explanation: String(row.explanation ?? ""),
      points: Number(row.points ?? 1),
      externalId: String(row.id ?? row.externalId ?? ""),
      externalSource: EXTERNAL_BANK_PILOT100,
    };
  });
}
