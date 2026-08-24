/**
 * Assessment durable store (.data/aep-quizzes.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-quizzes.json");

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

export function ensureQuizzesStore(): QuizzesDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as QuizzesDatabase;
    return {
      categories: raw.categories ?? [],
      questions: raw.questions ?? [],
      quizzes: raw.quizzes ?? [],
      quizQuestions: raw.quizQuestions ?? [],
      attempts: raw.attempts ?? [],
      answers: raw.answers ?? [],
      reviews: raw.reviews ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readQuizzesDb(): QuizzesDatabase {
  return ensureQuizzesStore();
}

export function writeQuizzesDb(mutator: (db: QuizzesDatabase) => void): QuizzesDatabase {
  const db = ensureQuizzesStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
