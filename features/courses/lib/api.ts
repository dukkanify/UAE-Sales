/**
 * Browser client for course management APIs.
 */

import { authFetch } from "@/features/auth/services/auth-api";

export async function courseFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  return authFetch<T>(url, init);
}
