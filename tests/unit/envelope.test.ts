import { describe, expect, it } from "vitest";

import { ApiError, API_VERSION, paginate, parsePagination } from "@/lib/api/envelope";

describe("API envelope helpers", () => {
  it("exposes API version", () => {
    expect(API_VERSION).toBe("v1");
  });

  it("parses pagination with clamps", () => {
    const url = new URL("https://example.com/api?page=2&pageSize=500&sortDir=asc&q=atpl");
    const p = parsePagination(url);
    expect(p.page).toBe(2);
    expect(p.pageSize).toBe(100);
    expect(p.sortDir).toBe("asc");
    expect(p.q).toBe("atpl");
  });

  it("defaults invalid page to 1", () => {
    const url = new URL("https://example.com/api?page=0&pageSize=-3");
    const p = parsePagination(url, { pageSize: 12 });
    expect(p.page).toBe(1);
    expect(p.pageSize).toBe(1);
  });

  it("paginates arrays", () => {
    const items = [1, 2, 3, 4, 5];
    const page = paginate(items, 2, 2);
    expect(page.data).toEqual([3, 4]);
    expect(page.total).toBe(5);
    expect(page.totalPages).toBe(3);
  });

  it("builds ApiError with code and status", () => {
    const err = new ApiError(401, "unauthorized", "Nope");
    expect(err.status).toBe(401);
    expect(err.code).toBe("unauthorized");
    expect(err.message).toBe("Nope");
  });
});
