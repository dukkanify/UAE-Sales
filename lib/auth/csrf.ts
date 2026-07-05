const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, "");
}

function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origins = new Set<string>();

  if (appUrl) {
    origins.add(normalizeOrigin(appUrl));
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return Array.from(origins);
}

export function shouldValidateCsrf(request: Request): boolean {
  return MUTATION_METHODS.has(request.method.toUpperCase());
}

export function validateCsrfOrigin(request: Request): boolean {
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0) {
    return true;
  }

  const origin = request.headers.get("origin");
  if (origin && allowedOrigins.includes(normalizeOrigin(origin))) {
    return true;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = normalizeOrigin(new URL(referer).origin);
      return allowedOrigins.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  // Server-to-server or same-origin navigation without Origin header.
  return process.env.NODE_ENV !== "production";
}
