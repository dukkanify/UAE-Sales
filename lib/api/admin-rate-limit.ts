import { enforceApiRateLimit } from "@/lib/api/rate-limit";

export async function enforceAdminRateLimit(
  request: Request,
  scope: string,
  userId: string,
): Promise<void> {
  await enforceApiRateLimit(request, {
    scope: `admin-${scope}`,
    limit: 60,
    windowMs: 60_000,
    identifier: userId,
  });
}
