import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".data");
const SERVERLESS_DATA_DIR = path.join("/tmp", "sooqna-data");
const memoryStore = new Map<string, unknown>();

let resolvedDataDir: string | null = null;
let fsAvailable: boolean | null = null;

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
  if (resolvedDataDir) {
    return resolvedDataDir;
  }

  for (const candidate of getCandidateDataDirs()) {
    try {
      await mkdir(candidate, { recursive: true });
      resolvedDataDir = candidate;
      fsAvailable = true;
      return candidate;
    } catch {
      // Try the next writable location.
    }
  }

  fsAvailable = false;
  return null;
}

async function canUseFilesystem(): Promise<boolean> {
  if (fsAvailable === false) {
    return false;
  }

  return Boolean(await resolveDataDir());
}

function getFilePath(filename: string, dataDir: string): string {
  return path.join(dataDir, filename);
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const cached = memoryStore.get(filename);
  if (cached !== undefined) {
    return cached as T;
  }

  const dataDir = await resolveDataDir();
  if (!dataDir) {
    return fallback;
  }

  const filePath = getFilePath(filename, dataDir);
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as T;
    memoryStore.set(filename, parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  memoryStore.set(filename, data);

  if (!(await canUseFilesystem()) || !resolvedDataDir) {
    return;
  }

  const filePath = getFilePath(filename, resolvedDataDir);
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    fsAvailable = false;
    resolvedDataDir = null;
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
