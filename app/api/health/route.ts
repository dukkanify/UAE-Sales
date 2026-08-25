import { NextResponse } from "next/server";

import { getHealthSnapshot } from "@/services/ops/health-service";
import { writeOpsLog } from "@/services/ops/logging-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deep = searchParams.get("deep") === "1";
    const ready = searchParams.get("ready") === "1";

    const snapshot = getHealthSnapshot({ deep: deep || ready });

    if (ready) {
      // Readiness = can the process serve traffic. Soft ops signals (error buffer,
      // security noise, backups) stay on deep health but must not flap uptime probes.
      const readinessIgnored = new Set(["error_rate", "security_events", "backups"]);
      const failed = snapshot.checks.some(
        (c) => c.status === "fail" && !readinessIgnored.has(c.id),
      );
      return NextResponse.json(
        {
          ready: !failed,
          status: snapshot.status,
          timestamp: snapshot.timestamp,
        },
        { status: failed ? 503 : 200 },
      );
    }

    // Public health — no user counts / internal inventory.
    // deployment.* lets ops confirm which git SHA/aliases Vercel is serving.
    const deployment = {
      gitSha:
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.GITHUB_SHA ??
        process.env.COMMIT_SHA ??
        null,
      gitRef: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      vercelUrl: process.env.VERCEL_URL ?? null,
      target: process.env.VERCEL_TARGET_ENV ?? null,
    };

    return NextResponse.json({
      status: snapshot.status === "degraded" ? "degraded" : "ok",
      service: snapshot.service,
      env: snapshot.env,
      deployment,
      checks: deep
        ? snapshot.checks
        : snapshot.checks.filter((c) => ["app", "database", "storage"].includes(c.id)),
      timestamp: snapshot.timestamp,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health check failed";
    console.error("[health]", message);
    return NextResponse.json(
      {
        ready: false,
        status: "degraded",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

export async function POST() {
  try {
    // heartbeat from uptime monitors
    writeOpsLog({
      level: "info",
      category: "application",
      message: "Health heartbeat received",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Heartbeat failed";
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}
