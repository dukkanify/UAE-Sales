import { describe, expect, it } from "vitest";

import { clearRateLimit, rateLimit } from "@/lib/security/rate-limit";

describe("rateLimit", () => {
  it("allows requests within window and then blocks", () => {
    const key = `test:${Date.now()}`;
    clearRateLimit(key);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    const blocked = rateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    clearRateLimit(key);
  });
});
