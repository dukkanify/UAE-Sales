/**
 * Zero-dependency browser CSRF helpers.
 * Kept separate from auth-api to avoid webpack circular/dynamic-import export glitches.
 */

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )aep_csrf=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function ensureBrowserCsrf(): Promise<string | null> {
  const existing = getCsrfToken();
  if (existing) return existing;
  try {
    await fetch("/api/auth/me", { credentials: "include" });
  } catch {
    /* ignore — cookie may already exist or network briefly failed */
  }
  return getCsrfToken();
}

export function csrfHeaders(): HeadersInit {
  const csrf = getCsrfToken();
  return csrf ? { "x-csrf-token": csrf } : {};
}
