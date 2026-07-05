import { isDatabaseConfigured } from "@/lib/prisma";

export async function withDataFallback<T>(
  loader: () => Promise<T>,
  fallback: () => T | Promise<T>,
  label: string,
): Promise<T> {
  if (!isDatabaseConfigured()) {
    return fallback();
  }

  try {
    return await loader();
  } catch (error) {
    console.warn(`[data:${label}] falling back to mock`, error);
    return fallback();
  }
}
