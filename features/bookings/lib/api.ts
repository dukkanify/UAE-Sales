import { authFetch } from "@/features/auth/services/auth-api";

export async function bookingFetch<T>(url: string, init?: RequestInit) {
  return authFetch<T>(url, init);
}

export async function bookingJson<T>(url: string, method: string, body?: unknown) {
  return bookingFetch<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
