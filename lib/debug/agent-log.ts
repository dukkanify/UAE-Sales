/**
 * Debug-mode NDJSON logger (temporary instrumentation).
 * @internal
 */
import { appendFileSync } from "fs";

export function agentLog(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
}): void {
  try {
    appendFileSync(
      "/opt/cursor/logs/debug.log",
      JSON.stringify({ ...payload, timestamp: Date.now(), data: payload.data ?? {} }) + "\n",
    );
  } catch {
    // ignore logging failures
  }
}
