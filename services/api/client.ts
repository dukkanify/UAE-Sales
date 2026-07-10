import { ApiError } from "./errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function isApiConfigured() {
  return Boolean(API_BASE_URL);
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
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
