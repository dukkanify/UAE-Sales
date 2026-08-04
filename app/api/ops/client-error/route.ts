import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/security/rate-limit";
import { writeOpsLog } from "@/services/ops/logging-service";
import { getRequestContext } from "@/services/auth/guards";

/** Browser error boundary reporter — rate limited, no auth required. */
export async function POST(request: Request) {
  const ctx = getRequestContext(request);
  const ip = ctx.ipAddress ?? "unknown";
  const limited = rateLimit(`client-error:${ip}`, 20, 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    message?: string;
    digest?: string;
    path?: string;
  } | null;

  writeOpsLog({
    level: "error",
    category: "error",
    message: (body?.message || "Client error").slice(0, 500),
    details: { digest: body?.digest },
    path: body?.path ?? null,
  });

  return NextResponse.json({ ok: true });
}
