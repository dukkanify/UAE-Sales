import { authFetch } from "@/features/auth/services/auth-api";

export async function classFetch<T>(url: string, init?: RequestInit) {
  return authFetch<T>(url, init);
}
