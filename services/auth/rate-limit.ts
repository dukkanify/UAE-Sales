import { loadCollection, saveCollection } from "@/services/payments/data-store";

type RateLimitRecord = {
  key: string;
  count: number;
  windowStart: number;
};

const FILE = "auth-rate-limits.json";
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

export async function checkRateLimit(key: string): Promise<boolean> {
  const all = await loadCollection<RateLimitRecord>(FILE);
  const now = Date.now();
  const existing = all.find((item) => item.key === key);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    const next = all.filter((item) => item.key !== key);
    next.push({ key, count: 1, windowStart: now });
    await saveCollection(FILE, next);
    return true;
  }

  if (existing.count >= MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  await saveCollection(
    FILE,
    all.map((item) => (item.key === key ? existing : item)),
  );
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
