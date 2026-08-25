/**
 * Assessment durable store (.data/aep-quizzes.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  BankQuestion,
  InstructorReview,
  QuestionBankCategory,
  Quiz,
  QuizAnswer,
  QuizAttempt,
  QuizQuestionLink,
} from "@/types/quizzes";

export interface QuizzesDatabase {
  categories: QuestionBankCategory[];
  questions: BankQuestion[];
  quizzes: Quiz[];
  quizQuestions: QuizQuestionLink[];
  attempts: QuizAttempt[];
  answers: QuizAnswer[];
  reviews: InstructorReview[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-quizzes.json");
}

function emptyDb(): QuizzesDatabase {
  return {
    categories: [],
    questions: [],
    quizzes: [],
    quizQuestions: [],
    attempts: [],
    answers: [],
    reviews: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<QuizzesDatabase>): QuizzesDatabase {
  return {
    ...emptyDb(),
    ...raw,
    categories: raw.categories ?? [],
    questions: raw.questions ?? [],
    quizzes: raw.quizzes ?? [],
    quizQuestions: raw.quizQuestions ?? [],
    attempts: raw.attempts ?? [],
    answers: raw.answers ?? [],
    reviews: raw.reviews ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureQuizzesStore(): QuizzesDatabase {
  const raw = readJsonFile<Partial<QuizzesDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readQuizzesDb(): QuizzesDatabase {
  return ensureQuizzesStore();
}

export function writeQuizzesDb(mutator: (db: QuizzesDatabase) => void): QuizzesDatabase {
  const db = ensureQuizzesStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
