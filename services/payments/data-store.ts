import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
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
