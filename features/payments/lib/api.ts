import { authFetch } from "@/features/auth/services/auth-api";

export async function payFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  return authFetch<T>(url, init);
}

export function payJson<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  return payFetch<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
