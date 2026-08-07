import { describe, expect, it } from "vitest";

import { getHealthSnapshot } from "@/services/ops/health-service";
import { listOpsLogs, writeOpsLog } from "@/services/ops/logging-service";

describe("health + ops logging", () => {
  it("builds a deep snapshot without throwing", () => {
    const snapshot = getHealthSnapshot({ deep: true });
    expect(snapshot.service).toBe("aviatorpass");
    expect(snapshot.checks.length).toBeGreaterThan(3);
    expect(snapshot.checks.some((c) => c.id === "app")).toBe(true);
    expect(snapshot.checks.some((c) => c.id === "database")).toBe(true);
  });

  it("records ops logs through the memory-backed store", () => {
    const entry = writeOpsLog({
      level: "info",
      category: "application",
      message: "health unit probe",
    });
    expect(entry.id).toBeTruthy();
    const found = listOpsLogs({ q: "health unit probe", limit: 20 }).find((e) => e.id === entry.id);
    expect(found?.message).toBe("health unit probe");
  });
});
