import { loadCollection, saveCollection } from "@/services/payments/data-store";

type RateLimitRecord = {
  key: string;
  count: number;
  windowStart: number;
};

const FILE = "auth-rate-limits.json";
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

export type RateLimitOptions = {
  maxRequests?: number;
  windowMs?: number;
};

export async function checkRateLimit(
  key: string,
  options?: RateLimitOptions,
): Promise<boolean> {
  const maxRequests = options?.maxRequests ?? MAX_REQUESTS;
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const all = await loadCollection<RateLimitRecord>(FILE);
  const now = Date.now();
  const existing = all.find((item) => item.key === key);

  if (!existing || now - existing.windowStart > windowMs) {
    const next = all.filter((item) => item.key !== key);
    next.push({ key, count: 1, windowStart: now });
    await saveCollection(FILE, next);
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count += 1;
  await saveCollection(
    FILE,
    all.map((item) => (item.key === key ? existing : item)),
  );
  return true;
}

export async function recordRateLimitFailure(key: string): Promise<void> {
  const all = await loadCollection<RateLimitRecord>(FILE);
  const now = Date.now();
  const existing = all.find((item) => item.key === key);
  if (!existing) {
    await saveCollection(FILE, [...all, { key, count: 3, windowStart: now }]);
    return;
  }
  existing.count = Math.max(existing.count, 3) + 1;
  await saveCollection(
    FILE,
    all.map((item) => (item.key === key ? existing : item)),
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
