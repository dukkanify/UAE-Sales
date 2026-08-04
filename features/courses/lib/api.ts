/**
 * Browser client for course management APIs.
 */

import { authFetch } from "@/features/auth/services/auth-api";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )aep_csrf=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function courseFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  return authFetch<T>(url, init);
}

export async function courseUpload<T>(
  url: string,
  form: FormData,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const csrf = getCsrfToken();
  const headers = new Headers();
  if (csrf) headers.set("x-csrf-token", csrf);
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: form,
    credentials: "include",
  });
  const json = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    error?: string;
  } | null;
  if (!json) return { success: false, data: null, error: "Unexpected server response" };
  return {
    success: Boolean(json.success),
    data: (json.data as T) ?? null,
    error: json.error ?? null,
  };
}
