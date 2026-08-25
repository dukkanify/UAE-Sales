/**
 * AI durable store — conversations, usage, feedback, plans, logs (not LLM weights).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
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

function dataFile() {
  return path.join(dataDir(), "aep-ai.json");
}

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

function normalizeDb(raw: Partial<AiDatabase>): AiDatabase {
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
}

export function ensureAiStore(): AiDatabase {
  const raw = readJsonFile<Partial<AiDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readAiDb(): AiDatabase {
  return ensureAiStore();
}

export function writeAiDb(mutator: (db: AiDatabase) => void): AiDatabase {
  const db = ensureAiStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
