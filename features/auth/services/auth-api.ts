/**
 * Browser client for auth API calls.
 */

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )aep_csrf=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function ensureBrowserCsrf(): Promise<string | null> {
  if (getCsrfToken()) return getCsrfToken();
  await fetch("/api/auth/me", { credentials: "include" });
  return getCsrfToken();
}

/** Headers for raw `fetch` mutations (FormData uploads, Ops POST, etc.). */
export function csrfHeaders(): HeadersInit {
  const csrf = getCsrfToken();
  return csrf ? { "x-csrf-token": csrf } : {};
}

export async function authFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const csrf = await ensureBrowserCsrf();
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (csrf) headers.set("x-csrf-token", csrf);

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  const json = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    error?: string | { message?: string; code?: string } | null;
  } | null;

  if (!json) {
    return { success: false, data: null, error: "Unexpected server response" };
  }

  const err =
    typeof json.error === "string"
      ? json.error
      : json.error && typeof json.error === "object"
        ? json.error.message || json.error.code || "Request failed"
        : null;

  return {
    success: Boolean(json.success),
    data: (json.data as T) ?? null,
    error: err,
  };
}
