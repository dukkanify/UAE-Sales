/**
 * Temporary agent debug logging (NDJSON → /opt/cursor/logs/debug.log).
 * Remove after auth session-switch investigation.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const LOG_PATH = "/opt/cursor/logs/debug.log";

export type AgentLogPayload = {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: number;
  runId?: string;
};

export function agentLog(payload: AgentLogPayload): void {
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    appendFileSync(
      LOG_PATH,
      `${JSON.stringify({
        ...payload,
        data: payload.data ?? {},
        timestamp: payload.timestamp ?? Date.now(),
      })}\n`,
    );
  } catch {
    // never break auth for logging
  }
}
