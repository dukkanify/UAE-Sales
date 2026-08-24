import { NextResponse } from "next/server";

import { getHealthSnapshot } from "@/services/ops/health-service";
import { writeOpsLog } from "@/services/ops/logging-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deep = searchParams.get("deep") === "1";
  const ready = searchParams.get("ready") === "1";

  const snapshot = getHealthSnapshot({ deep: deep || ready });

  if (ready) {
    const failed = snapshot.checks.some((c) => c.status === "fail");
    return NextResponse.json(
      {
        ready: !failed,
        status: snapshot.status,
        timestamp: snapshot.timestamp,
      },
      { status: failed ? 503 : 200 },
    );
  }

  // Public health — no user counts / internal inventory
  return NextResponse.json({
    status: snapshot.status === "degraded" ? "degraded" : "ok",
    service: snapshot.service,
    env: snapshot.env,
    checks: deep
      ? snapshot.checks
      : snapshot.checks.filter((c) =>
          ["app", "database", "storage"].includes(c.id),
        ),
    timestamp: snapshot.timestamp,
  });
}

export async function POST() {
  // heartbeat from uptime monitors
  writeOpsLog({
    level: "info",
    category: "application",
    message: "Health heartbeat received",
  });
  return NextResponse.json({ ok: true });
}
