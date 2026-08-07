/**
 * JSON file store — memory fallback when disk writes fail.
 */

import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";

describe("json-file-store", () => {
  it("reads back values written to disk", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "aep-json-"));
    const file = path.join(dir, "demo.json");
    writeJsonFile(file, { ok: true, n: 3 });
    const value = readJsonFile<{ ok: boolean; n: number }>(file, () => ({ ok: false, n: 0 }));
    expect(value).toEqual({ ok: true, n: 3 });
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({ ok: true, n: 3 });
  });

  it("keeps serving from memory when the filesystem is read-only", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "aep-json-ro-"));
    const file = path.join(dir, "locked.json");
    writeFileSync(file, JSON.stringify({ seed: 1 }), "utf8");
    chmodSync(file, 0o444);
    chmodSync(dir, 0o555);

    writeJsonFile(file, { seed: 2, rescued: true });
    const value = readJsonFile<{ seed: number; rescued?: boolean }>(file, () => ({ seed: 0 }));
    expect(value).toEqual({ seed: 2, rescued: true });

    chmodSync(dir, 0o755);
    chmodSync(file, 0o644);
  });
});
