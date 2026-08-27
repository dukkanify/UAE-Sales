import { NextResponse } from "next/server";
import { processDisputeReminders } from "@/services/payments/dispute-reminders";

/**
 * Cron / ops endpoint for dispute window reminders (48h, 24h, expired).
 * Protect with CRON_SECRET (Authorization: Bearer or x-cron-secret).
 * Vercel Hobby allows at most one run/day — schedule is daily in vercel.json.
 */
export async function POST(request: Request) {
  const configured = process.env.CRON_SECRET?.trim();
  if (configured) {
    const header =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      request.headers.get("x-cron-secret") ??
      "";
    if (header !== configured) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET_REQUIRED" },
      { status: 503 },
    );
  }

  try {
    const result = await processDisputeReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "REMINDER_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
