import { authFetch } from "@/features/auth/services/auth-api";

export async function certFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  return authFetch<T>(url, init);
}

export function certJson<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  return certFetch<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
