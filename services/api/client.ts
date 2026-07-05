import { ApiError } from "./errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function isApiConfigured() {
  return (
    process.env.NEXT_PUBLIC_USE_API === "true" ||
    Boolean(process.env.NEXT_PUBLIC_API_BASE_URL)
  );
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("uae-sales-auth-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "API mode is not enabled.",
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      let message: string | undefined;

      try {
        const body = (await response.json()) as { message?: string };
        message = body.message;
      } catch {
        message = undefined;
      }

      throw ApiError.fromResponse(response.status, message);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.network();
  }
}
