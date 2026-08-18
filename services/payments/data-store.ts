import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".data");
const SERVERLESS_DATA_DIR = path.join("/tmp", "sooqna-data");

type DataStoreState = {
  fsAvailable: boolean | null;
  memoryStore: Map<string, unknown>;
  mtimes: Map<string, number>;
  resolvedDataDir: string | null;
};

function getStoreState(): DataStoreState {
  const globalState = globalThis as typeof globalThis & {
    __sooqnaDataStore?: DataStoreState;
  };
  if (!globalState.__sooqnaDataStore) {
    globalState.__sooqnaDataStore = {
      fsAvailable: null,
      memoryStore: new Map(),
      mtimes: new Map(),
      resolvedDataDir: null,
    };
  }
  return globalState.__sooqnaDataStore;
}

function getCandidateDataDirs(): string[] {
  const configured = process.env.DATA_DIR?.trim();
  const candidates = [
    configured,
    process.env.VERCEL ? SERVERLESS_DATA_DIR : null,
    DEFAULT_DATA_DIR,
    SERVERLESS_DATA_DIR,
  ].filter((value): value is string => Boolean(value));

  return [...new Set(candidates)];
}

async function resolveDataDir(): Promise<string | null> {
  const state = getStoreState();
  if (state.resolvedDataDir) {
    return state.resolvedDataDir;
  }

  for (const candidate of getCandidateDataDirs()) {
    try {
      await mkdir(candidate, { recursive: true });
      state.resolvedDataDir = candidate;
      state.fsAvailable = true;
      return candidate;
    } catch {
      // Try the next writable location.
    }
  }

  state.fsAvailable = false;
  return null;
}

async function canUseFilesystem(): Promise<boolean> {
  const state = getStoreState();
  if (state.fsAvailable === false) {
    return false;
  }

  return Boolean(await resolveDataDir());
}

function getFilePath(filename: string, dataDir: string): string {
  return path.join(dataDir, filename);
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const state = getStoreState();
  const dataDir = await resolveDataDir();

  if (dataDir) {
    const filePath = getFilePath(filename, dataDir);
    try {
      const fileStat = await stat(filePath);
      const cached = state.memoryStore.get(filename);
      if (cached !== undefined && state.mtimes.get(filename) === fileStat.mtimeMs) {
        return cached as T;
      }
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as T;
      state.memoryStore.set(filename, parsed);
      state.mtimes.set(filename, fileStat.mtimeMs);
      return parsed;
    } catch {
      // Missing file or unreadable JSON — fall through to memory/fallback.
    }
  }

  const cached = state.memoryStore.get(filename);
  if (cached !== undefined) {
    return cached as T;
  }
  return fallback;
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const state = getStoreState();
  state.memoryStore.set(filename, data);

  if (!(await canUseFilesystem()) || !state.resolvedDataDir) {
    return;
  }

  const filePath = getFilePath(filename, state.resolvedDataDir);
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    const fileStat = await stat(filePath);
    state.mtimes.set(filename, fileStat.mtimeMs);
  } catch {
    state.fsAvailable = false;
    state.resolvedDataDir = null;
  }
}

export async function loadCollection<T>(filename: string): Promise<T[]> {
  return readJsonFile<T[]>(filename, []);
}

export async function saveCollection<T>(filename: string, data: T[]): Promise<void> {
  await writeJsonFile(filename, data);
}

export async function loadRecord<T>(filename: string): Promise<T | null> {
  return readJsonFile<T | null>(filename, null);
}

export async function saveRecord<T>(filename: string, data: T): Promise<void> {
  await writeJsonFile(filename, data);
}
