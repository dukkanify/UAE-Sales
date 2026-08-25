/**
 * Regression: raw writeFileSync stores 500'd Server Components on read-only hosts
 * (Vercel). Durable stores must use json-file-store memory fallback.
 */

import { chmodSync, mkdtempSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

import { clearJsonFileCache } from "@/lib/data/json-file-store";
import { getAtplProgramMarketing } from "@/lib/marketing/atpl-program-marketing";
import { ensureClassesStore, writeClassesDb } from "@/services/classes/store";
import { ensureLearningStore, writeLearningDb } from "@/services/learning/store";
import { ensurePaymentsStore, writePaymentsDb } from "@/services/payments/store";
import { ensureSupportOpsStore, writeSupportOpsStore } from "@/services/support-ops/store";
import { getMaintenancePublicStatus } from "@/services/support-ops/support-ops-service";

describe("readonly JSON stores (SSR safety)", () => {
  const previousCwd = process.cwd();

  afterEach(() => {
    clearJsonFileCache();
    process.chdir(previousCwd);
  });

  function chdirReadOnlyData() {
    const root = mkdtempSync(path.join(tmpdir(), "aep-ro-ssr-"));
    const data = path.join(root, ".data");
    mkdirSync(data, { recursive: true });
    chmodSync(data, 0o555);
    process.chdir(root);
    clearJsonFileCache();
    return { root, data };
  }

  it("ensureSupportOpsStore does not throw when .data is not writable", () => {
    chdirReadOnlyData();
    expect(() => ensureSupportOpsStore()).not.toThrow();
    const db = ensureSupportOpsStore();
    expect(db.seeded).toBe(false);
    expect(() => writeSupportOpsStore({ ...db, seeded: true })).not.toThrow();
    expect(ensureSupportOpsStore().seeded).toBe(true);
  });

  it("getMaintenancePublicStatus survives read-only .data (SC /maintenance path)", () => {
    chdirReadOnlyData();
    expect(() => getMaintenancePublicStatus()).not.toThrow();
    const status = getMaintenancePublicStatus();
    expect(typeof status.enabled).toBe("boolean");
    expect(status.statusMessage.length).toBeGreaterThan(0);
  });

  it("ensurePaymentsStore + marketing helper survive read-only .data", () => {
    chdirReadOnlyData();
    expect(() => ensurePaymentsStore()).not.toThrow();
    expect(() =>
      writePaymentsDb((d) => {
        d.seeded = true;
      }),
    ).not.toThrow();
    expect(ensurePaymentsStore().seeded).toBe(true);
    expect(() => getAtplProgramMarketing()).not.toThrow();
  });

  it("learning + classes stores survive read-only .data (student dashboard)", () => {
    chdirReadOnlyData();
    expect(() => ensureLearningStore()).not.toThrow();
    expect(() => ensureClassesStore()).not.toThrow();
    expect(() =>
      writeLearningDb((d) => {
        d.seeded = true;
      }),
    ).not.toThrow();
    expect(() =>
      writeClassesDb((d) => {
        d.seeded = true;
      }),
    ).not.toThrow();
    expect(ensureLearningStore().seeded).toBe(true);
    expect(ensureClassesStore().seeded).toBe(true);
  });

  it("still reads existing on-disk JSON when present before lock", () => {
    const root = mkdtempSync(path.join(tmpdir(), "aep-ro-seeded-"));
    const data = path.join(root, ".data");
    mkdirSync(data, { recursive: true });
    writeFileSync(
      path.join(data, "aep-support-ops.json"),
      JSON.stringify({ seeded: true, seedVersion: 2, supportRequests: [] }),
      "utf8",
    );
    chmodSync(data, 0o555);
    process.chdir(root);
    clearJsonFileCache();
    expect(ensureSupportOpsStore().seeded).toBe(true);
    expect(ensureSupportOpsStore().seedVersion).toBe(2);
  });
});
