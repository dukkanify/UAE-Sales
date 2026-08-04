/**
 * OpenAPI 3.1 document for /api/v1 (machine-readable API docs).
 */

import { API_VERSION } from "@/lib/api/envelope";

export function buildOpenApiDocument() {
  const paths: Record<string, Record<string, unknown>> = {
    "/api/v1/auth/otp/request": {
      post: {
        tags: ["Auth"],
        summary: "Request OTP",
        security: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string" },
                  purpose: { type: "string", enum: ["login", "register"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OTP sent" } },
      },
    },
    "/api/v1/auth/otp/verify": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP and receive access + refresh tokens",
        security: [],
        responses: { "200": { description: "Token pair" } },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token",
        security: [],
        responses: { "200": { description: "New token pair" } },
      },
    },
    "/api/v1/auth/revoke": {
      post: {
        tags: ["Auth"],
        summary: "Revoke refresh token(s)",
        responses: { "200": { description: "Revoked" } },
      },
    },
    "/api/v1/public/courses": {
      get: {
        tags: ["Public"],
        summary: "Public course catalog",
        security: [],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Paginated courses" } },
      },
    },
    "/api/v1/public/blog": { get: { tags: ["Public"], summary: "Public blog", security: [] } },
    "/api/v1/public/announcements": {
      get: { tags: ["Public"], summary: "Public announcements", security: [] },
    },
    "/api/v1/public/certificates/verify": {
      get: { tags: ["Public"], summary: "Verify certificate", security: [] },
      post: { tags: ["Public"], summary: "Verify certificate", security: [] },
    },
    "/api/v1/me": { get: { tags: ["Mobile"], summary: "Current user profile" } },
    "/api/v1/courses": { get: { tags: ["Mobile"], summary: "Courses" } },
    "/api/v1/lessons": { get: { tags: ["Mobile"], summary: "Lessons" } },
    "/api/v1/classes": { get: { tags: ["Mobile"], summary: "Live classes" } },
    "/api/v1/calendar": { get: { tags: ["Mobile"], summary: "Calendar events" } },
    "/api/v1/quizzes": { get: { tags: ["Mobile"], summary: "Quizzes" } },
    "/api/v1/certificates": { get: { tags: ["Mobile"], summary: "Certificates" } },
    "/api/v1/payments": { get: { tags: ["Mobile"], summary: "Payments catalog" } },
    "/api/v1/wallets": { get: { tags: ["Mobile"], summary: "Instructor wallet" } },
    "/api/v1/reports": { get: { tags: ["Mobile"], summary: "Reports" } },
    "/api/v1/communities": { get: { tags: ["Mobile"], summary: "Communities" } },
    "/api/v1/notifications": { get: { tags: ["Mobile"], summary: "Notifications" } },
    "/api/v1/support": { get: { tags: ["Mobile"], summary: "Support tickets" } },
    "/api/v1/analytics": { get: { tags: ["Mobile"], summary: "Analytics summary" } },
    "/api/v1/ai": { get: { tags: ["Mobile"], summary: "AI bootstrap" } },
    "/api/v1/users": { get: { tags: ["Admin"], summary: "List users" } },
    "/api/v1/platform/keys": {
      get: { tags: ["Platform"], summary: "List API keys" },
      post: { tags: ["Platform"], summary: "Create API key" },
    },
    "/api/v1/platform/webhooks": {
      get: { tags: ["Platform"], summary: "Webhook endpoints" },
      post: { tags: ["Platform"], summary: "Manage webhooks" },
    },
    "/api/v1/platform/integrations": {
      get: { tags: ["Platform"], summary: "Integration catalog" },
      post: { tags: ["Platform"], summary: "Update integration" },
    },
    "/api/v1/platform/queue": {
      get: { tags: ["Platform"], summary: "Queue jobs" },
      post: { tags: ["Platform"], summary: "Enqueue / process jobs" },
    },
    "/api/v1/platform/import": {
      get: { tags: ["Platform"], summary: "Import jobs" },
      post: { tags: ["Platform"], summary: "Start import" },
    },
    "/api/v1/platform/export": {
      get: { tags: ["Platform"], summary: "Export jobs" },
      post: { tags: ["Platform"], summary: "Start export (csv/json/xlsx/pdf)" },
    },
    "/api/v1/platform/monitoring": {
      get: { tags: ["Platform"], summary: "API monitoring metrics" },
    },
    "/api/v1/platform/cache": {
      get: { tags: ["Platform"], summary: "Cache metadata" },
      post: { tags: ["Platform"], summary: "Invalidate cache tag" },
    },
    "/api/v1/webhooks/inbound/zoom": {
      post: { tags: ["Webhooks"], summary: "Zoom inbound webhook", security: [] },
    },
    "/api/v1/openapi": {
      get: { tags: ["Docs"], summary: "This OpenAPI document", security: [] },
    },
  };

  return {
    openapi: "3.1.0",
    info: {
      title: "ATPL PASS Mobile & Integrations API",
      version: "1.0.0",
      description:
        "Versioned REST API (v1) for iOS/Android/React Native clients, public surfaces, webhooks, and integrations. Cookie session APIs remain under /api/* for the web app.",
      contact: { name: "ATPL PASS Platform" },
    },
    servers: [{ url: "/", description: "Same origin" }],
    tags: [
      { name: "Auth" },
      { name: "Public" },
      { name: "Mobile" },
      { name: "Admin" },
      { name: "Platform" },
      { name: "Webhooks" },
      { name: "Docs" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access token from /api/v1/auth/otp/verify (15m TTL)",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Server-to-server API key (hashed at rest)",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", const: true },
            data: {},
            error: { type: "null" },
            meta: {
              type: "object",
              properties: { version: { type: "string", example: API_VERSION } },
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", const: false },
            data: { type: "null" },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {},
              },
            },
            meta: { type: "object" },
          },
        },
      },
    },
    paths,
    "x-rate-limits": {
      public: "60 requests / minute / IP",
      bearer: "300 requests / minute / user",
      apiKey: "configurable per key (default 120 / minute)",
    },
    "x-version-history": [
      { version: "v1", released: "2026-08-04", notes: "Task 018 initial mobile & integrations API" },
    ],
  };
}
