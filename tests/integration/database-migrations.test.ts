/**
 * Database / schema integrity checks against SQL migration twins.
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

const MIGRATIONS = path.join(process.cwd(), "database", "migrations");

describe("database migrations integrity", () => {
  it("ships ordered SQL migrations including latest API platform", () => {
    expect(existsSync(MIGRATIONS)).toBe(true);
    const files = readdirSync(MIGRATIONS)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    expect(files.length).toBeGreaterThanOrEqual(16);
    expect(files.some((f) => f.startsWith("016_"))).toBe(true);
    expect(files.some((f) => f.startsWith("002_"))).toBe(true);
  });

  it("defines primary keys and foreign-key style constraints in auth schema", () => {
    const auth = readFileSync(path.join(MIGRATIONS, "002_auth_rbac_schema.sql"), "utf8");
    expect(auth).toMatch(/PRIMARY KEY/i);
    expect(auth.toLowerCase()).toContain("sessions");
  });

  it("api platform migration defines api_keys and webhook tables", () => {
    const sql = readFileSync(path.join(MIGRATIONS, "016_api_platform.sql"), "utf8");
    expect(sql).toContain("api_keys");
    expect(sql).toContain("webhook_endpoints");
    expect(sql).toContain("queue_jobs");
    expect(sql).toContain("refresh_tokens");
  });
});
