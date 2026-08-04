import { describe, expect, it } from "vitest";

import { PHASE2_PILLARS } from "@/constants/phase2";

describe("phase2 pillars", () => {
  it("registers twelve unique pillars and flags", () => {
    expect(PHASE2_PILLARS).toHaveLength(12);
    const ids = new Set(PHASE2_PILLARS.map((p) => p.id));
    const flags = new Set(PHASE2_PILLARS.map((p) => p.flag));
    expect(ids.size).toBe(12);
    expect(flags.size).toBe(12);
  });
});
