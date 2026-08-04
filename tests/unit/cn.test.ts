import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn (component class helper)", () => {
  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toContain("text-sm");
  });
});
