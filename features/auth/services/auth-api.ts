/**
 * Browser client for auth API calls.
 */

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )aep_csrf=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function ensureBrowserCsrf(): Promise<string | null> {
  if (getCsrfToken()) return getCsrfToken();
  await fetch("/api/auth/me", { credentials: "include" });
  return getCsrfToken();
}

export async function authFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const csrf = await ensureBrowserCsrf();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (csrf) headers.set("x-csrf-token", csrf);

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  const json = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    error?: string;
  } | null;

  if (!json) {
    return { success: false, data: null, error: "Unexpected server response" };
  }

  return {
    success: Boolean(json.success),
    data: (json.data as T) ?? null,
    error: json.error ?? null,
  };
}
