/**
 * CSRF enforcement for mutating API routes.
 */

import { NextResponse } from "next/server";

import { ensureCsrfToken, validateCsrfHeader } from "@/lib/security/cookies";

export class CsrfError extends Error {
  status = 403;
  constructor(message = "Invalid CSRF token") {
    super(message);
    this.name = "CsrfError";
  }
}

/**
 * Require a matching CSRF cookie + x-csrf-token header.
 * Bootstraps the cookie when missing so first-time clients can retry.
 */
export async function requireCsrf(request: Request): Promise<void> {
  await ensureCsrfToken();
  const header = request.headers.get("x-csrf-token");
  const ok = await validateCsrfHeader(header);
  if (!ok) {
    throw new CsrfError(
      "CSRF validation failed. Refresh the page and retry with x-csrf-token.",
    );
  }
}

export function csrfErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof CsrfError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  return null;
}
