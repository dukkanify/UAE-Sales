import { NextResponse } from "next/server";

import { listPhase2Capabilities } from "@/services/phase2/registry";

/**
 * Read-only Phase 2 capability discovery.
 * Safe for v1.0 — does not mutate data or enable unfinished modules.
 */
export async function GET() {
  const capabilities = listPhase2Capabilities();
  return NextResponse.json({
    success: true,
    data: {
      version: "2.0-planned",
      stability: "v1.0 preserved — Phase 2 additive",
      capabilities,
    },
    error: null,
  });
}
