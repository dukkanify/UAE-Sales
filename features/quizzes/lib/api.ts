/**
 * Browser client for assessment APIs.
 */

import { authFetch } from "@/features/auth/services/auth-api";

export async function quizFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  return authFetch<T>(url, init);
}

export function quizJson<T>(url: string, method: "POST" | "PATCH" | "DELETE" | "PUT", body?: unknown) {
  return quizFetch<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
