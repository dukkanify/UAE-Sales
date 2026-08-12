/**
 * Durable JSON file helpers with in-memory fallback.
 * On read-only hosts (e.g. Vercel serverless) disk writes fail — keep serving
 * from process memory so marketing SSR never 500s.
 *
 * Important: cache the *parsed* value, not only the raw string — re-parsing
 * multi‑MB files on every request (settings history) can OOM/timeout SSR.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const rawMemory = new Map<string, string>();
const parsedMemory = new Map<string, unknown>();

export function dataDir(): string {
  return path.join(process.cwd(), ".data");
}

export function readJsonFile<T>(filePath: string, fallback: () => T): T {
  if (parsedMemory.has(filePath)) {
    return parsedMemory.get(filePath) as T;
  }

  const mem = rawMemory.get(filePath);
  if (mem) {
    try {
      const parsed = JSON.parse(mem) as T;
      parsedMemory.set(filePath, parsed);
      return parsed;
    } catch {
      rawMemory.delete(filePath);
    }
  }

  try {
    if (!existsSync(filePath)) {
      const value = fallback();
      parsedMemory.set(filePath, value);
      return value;
    }
    const raw = readFileSync(filePath, "utf8");
    rawMemory.set(filePath, raw);
    const parsed = JSON.parse(raw) as T;
    parsedMemory.set(filePath, parsed);
    return parsed;
  } catch {
    const value = fallback();
    parsedMemory.set(filePath, value);
    return value;
  }
}

export function writeJsonFile(filePath: string, value: unknown): void {
  const raw = JSON.stringify(value, null, 2);
  rawMemory.set(filePath, raw);
  parsedMemory.set(filePath, value);

  try {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, raw, "utf8");
  } catch (error) {
    // Read-only filesystem (serverless) — memory copy remains authoritative.
    if (process.env.NODE_ENV !== "production") {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      console.warn(
        `[data] write skipped for ${path.basename(filePath)}${code ? ` (${code})` : ""}`,
      );
    }
  }
}

/** Drop cached entries (tests). */
export function clearJsonFileCache(filePath?: string): void {
  if (!filePath) {
    rawMemory.clear();
    parsedMemory.clear();
    return;
  }
  rawMemory.delete(filePath);
  parsedMemory.delete(filePath);
}
