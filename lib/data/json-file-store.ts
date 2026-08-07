/**
 * Durable JSON file helpers with in-memory fallback.
 * On read-only hosts (e.g. Vercel serverless) disk writes fail — keep serving
 * from process memory so marketing SSR never 500s.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const memory = new Map<string, string>();

export function dataDir(): string {
  return path.join(process.cwd(), ".data");
}

export function readJsonFile<T>(filePath: string, fallback: () => T): T {
  const mem = memory.get(filePath);
  if (mem) {
    try {
      return JSON.parse(mem) as T;
    } catch {
      memory.delete(filePath);
    }
  }

  try {
    if (!existsSync(filePath)) return fallback();
    const raw = readFileSync(filePath, "utf8");
    memory.set(filePath, raw);
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

export function writeJsonFile(filePath: string, value: unknown): void {
  const raw = JSON.stringify(value, null, 2);
  memory.set(filePath, raw);

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
