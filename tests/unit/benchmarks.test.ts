/**
 * Performance micro-benchmarks (documented thresholds).
 * Run: npm run test:bench
 */

import { describe, expect, it } from "vitest";

import { hashPassword, hashValue } from "@/lib/security/crypto";
import { paginate } from "@/lib/api/envelope";
import { hasPermission } from "@/services/auth/permissions";
import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";

function timed(fn: () => void, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return performance.now() - start;
}

describe("performance benchmarks", () => {
  it("hashValue throughput stays interactive", () => {
    const ms = timed(() => hashValue("benchmark-input"), 2000);
    // Generous CI-safe budget
    expect(ms).toBeLessThan(2000);
  });

  it("permission checks are cheap", () => {
    const ms = timed(() => hasPermission(ROLES.INSTRUCTOR, PERMISSIONS.COURSES_OWN), 5000);
    expect(ms).toBeLessThan(500);
  });

  it("paginate large arrays quickly", () => {
    const items = Array.from({ length: 10_000 }, (_, i) => i);
    const ms = timed(() => paginate(items, 50, 20), 200);
    expect(ms).toBeLessThan(1000);
  });

  it("password hashing completes within budget", () => {
    const start = performance.now();
    hashPassword("BenchmarkPass1");
    const ms = performance.now() - start;
    expect(ms).toBeLessThan(5000);
  });
});
