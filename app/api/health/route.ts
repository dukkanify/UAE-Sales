import { NextResponse } from "next/server";

import { publicEnv } from "@/config/env";
import { isSupabaseConfigured } from "@/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "aep-web",
    env: publicEnv.NEXT_PUBLIC_APP_ENV,
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
