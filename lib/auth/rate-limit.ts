type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export interface RateLimitStore {
  check(config: RateLimitConfig): Promise<RateLimitResult> | RateLimitResult;
}

class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  check({ key, limit, windowMs }: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    this.store.set(key, entry);
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    };
  }
}

/**
 * Optional Redis/Upstash adapter.
 * Set REDIS_URL and implement fetch-based increment in production
 * for multi-instance deployments. Falls back to in-memory store.
 */
class RedisRateLimitStore implements RateLimitStore {
  private memoryFallback = new MemoryRateLimitStore();
  private redisUrl: string;

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl;
  }

  async check(config: RateLimitConfig): Promise<RateLimitResult> {
    try {
      const bucket = Math.floor(Date.now() / config.windowMs);
      const redisKey = `ratelimit:${config.key}:${bucket}`;
      const response = await fetch(`${this.redisUrl}/incr/${encodeURIComponent(redisKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return this.memoryFallback.check(config);
      }

      const count = Number(await response.text());
      const resetAt = (bucket + 1) * config.windowMs;

      return {
        allowed: count <= config.limit,
        remaining: Math.max(0, config.limit - count),
        resetAt,
      };
    } catch {
      return this.memoryFallback.check(config);
    }
  }
}

let store: RateLimitStore | null = null;

function getRateLimitStore(): RateLimitStore {
  if (store) {
    return store;
  }

  const redisUrl = process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  store = redisUrl ? new RedisRateLimitStore(redisUrl) : new MemoryRateLimitStore();
  return store;
}

export async function checkRateLimit(
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const result = getRateLimitStore().check(config);
  return result instanceof Promise ? result : Promise.resolve(result);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function enforceRateLimit(
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  return checkRateLimit(config);
}
