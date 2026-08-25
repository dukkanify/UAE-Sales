/**
 * Dashboard loading helpers — never let optional query failures crash RSC.
 */

import { generateId } from "@/lib/security/crypto";
import { writeOpsLog } from "@/services/ops/logging-service";

export function newDashboardCorrelationId(): string {
  return `dash_${generateId().slice(0, 12)}`;
}

export function safeDashboardQuery<T>(options: {
  label: string;
  userId?: string | null;
  role?: string | null;
  correlationId: string;
  path?: string;
  fallback: T;
  run: () => T;
}): T {
  try {
    return options.run();
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    writeOpsLog({
      level: "error",
      category: "error",
      message: `Dashboard query failed: ${options.label}`,
      userId: options.userId ?? null,
      path: options.path ?? null,
      details: {
        correlationId: options.correlationId,
        failedQuery: options.label,
        role: options.role ?? null,
        errMessage,
        stack: stack?.slice(0, 4000) ?? null,
        timestamp: new Date().toISOString(),
      },
    });
    return options.fallback;
  }
}

export async function safeDashboardQueryAsync<T>(options: {
  label: string;
  userId?: string | null;
  role?: string | null;
  correlationId: string;
  path?: string;
  fallback: T;
  run: () => Promise<T>;
}): Promise<T> {
  try {
    return await options.run();
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    writeOpsLog({
      level: "error",
      category: "error",
      message: `Dashboard query failed: ${options.label}`,
      userId: options.userId ?? null,
      path: options.path ?? null,
      details: {
        correlationId: options.correlationId,
        failedQuery: options.label,
        role: options.role ?? null,
        errMessage,
        stack: stack?.slice(0, 4000) ?? null,
        timestamp: new Date().toISOString(),
      },
    });
    return options.fallback;
  }
}
