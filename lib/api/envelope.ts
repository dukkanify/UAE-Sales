/**
 * API v1 envelope, errors, pagination helpers.
 */

import { NextResponse } from "next/server";

export const API_VERSION = "v1";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function ok<T>(data: T, init?: { status?: number; headers?: HeadersInit; meta?: Record<string, unknown> }) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      meta: {
        version: API_VERSION,
        ...(init?.meta ?? {}),
      },
    },
    { status: init?.status ?? 200, headers: init?.headers },
  );
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
        meta: { version: API_VERSION },
      },
      { status: error.status },
    );
  }
  console.error("[api/v1]", error);
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "internal_error",
        message: "Internal server error",
        details: null,
      },
      meta: { version: API_VERSION },
    },
    { status: 500 },
  );
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  q?: string;
}

export function parsePagination(url: URL, defaults?: { pageSize?: number }): PaginationQuery {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("pageSize") ?? defaults?.pageSize ?? 20) || 20),
  );
  const sortDir = url.searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const sortBy = url.searchParams.get("sortBy") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  return { page, pageSize, sortBy, sortDir, q };
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function clientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
