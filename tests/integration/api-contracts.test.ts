/**
 * API contract tests for v1 helpers + OpenAPI document shape.
 * Runtime HTTP smoke remains in scripts/uat-smoke.mjs / e2e.
 */

import { describe, expect, it } from "vitest";

import { buildOpenApiDocument } from "@/services/api-platform/openapi";
import { ApiError, fail, ok } from "@/lib/api/envelope";
import { DEFAULT_SLA } from "@/services/support-ops/store";

describe("API contracts", () => {
  it("OpenAPI document declares v1 paths and security schemes", () => {
    const doc = buildOpenApiDocument();
    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.paths["/api/v1/me"]).toBeTruthy();
    expect(doc.paths["/api/v1/auth/otp/verify"]).toBeTruthy();
    expect(doc.components.securitySchemes.bearerAuth).toBeTruthy();
    expect(doc.components.securitySchemes.apiKeyAuth).toBeTruthy();
  });

  it("ok/fail envelope shapes", async () => {
    const success = ok({ hello: "world" });
    const successBody = await success.json();
    expect(successBody.success).toBe(true);
    expect(successBody.data.hello).toBe("world");
    expect(successBody.meta.version).toBe("v1");

    const failure = fail(new ApiError(400, "validation_error", "bad"));
    const failureBody = await failure.json();
    expect(failure.status).toBe(400);
    expect(failureBody.success).toBe(false);
    expect(failureBody.error.code).toBe("validation_error");
  });

  it("SLA defaults match support policy", () => {
    expect(DEFAULT_SLA.critical.responseHours).toBe(2);
    expect(DEFAULT_SLA.high.responseHours).toBe(8);
    expect(DEFAULT_SLA.medium.responseHours).toBe(24);
    expect(DEFAULT_SLA.low.responseHours).toBe(48);
  });
});
