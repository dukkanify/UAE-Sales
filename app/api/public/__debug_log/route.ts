import { NextResponse } from "next/server";

import { agentLog } from "@/lib/debug/agent-log";

/** Edge/client ingest for temporary auth debug instrumentation. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      hypothesisId?: string;
      location?: string;
      message?: string;
      data?: Record<string, unknown>;
      timestamp?: number;
      runId?: string;
    };
    agentLog({
      hypothesisId: body.hypothesisId ?? "?",
      location: body.location ?? "unknown",
      message: body.message ?? "client-log",
      data: body.data ?? {},
      timestamp: body.timestamp,
      runId: body.runId,
    });
  } catch {
    // ignore malformed debug payloads
  }
  return NextResponse.json({ ok: true });
}
