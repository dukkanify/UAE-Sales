/**
 * AI durable store — conversations, usage, feedback, plans, logs (not LLM weights).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type {
  AiConversation,
  AiFeedback,
  AiLogEntry,
  AiMessage,
  AiPromptTemplate,
  AiRecommendation,
  AiStudyPlan,
  AiUsageRecord,
} from "@/types/ai";

export interface AiDatabase {
  conversations: AiConversation[];
  messages: AiMessage[];
  usage: AiUsageRecord[];
  feedback: AiFeedback[];
  prompts: AiPromptTemplate[];
  recommendations: AiRecommendation[];
  studyPlans: AiStudyPlan[];
  logs: AiLogEntry[];
  rateWindow: Array<{ userId: string; at: string }>;
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-ai.json");

function emptyDb(): AiDatabase {
  return {
    conversations: [],
    messages: [],
    usage: [],
    feedback: [],
    prompts: [],
    recommendations: [],
    studyPlans: [],
    logs: [],
    rateWindow: [],
    seeded: false,
  };
}

export function ensureAiStore(): AiDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<AiDatabase>;
    return {
      ...emptyDb(),
      ...raw,
      conversations: raw.conversations ?? [],
      messages: raw.messages ?? [],
      usage: raw.usage ?? [],
      feedback: raw.feedback ?? [],
      prompts: raw.prompts ?? [],
      recommendations: raw.recommendations ?? [],
      studyPlans: raw.studyPlans ?? [],
      logs: raw.logs ?? [],
      rateWindow: raw.rateWindow ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readAiDb(): AiDatabase {
  return ensureAiStore();
}

export function writeAiDb(mutator: (db: AiDatabase) => void): AiDatabase {
  const db = ensureAiStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
