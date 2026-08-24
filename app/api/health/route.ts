import { NextResponse } from "next/server";

import { publicEnv, isSupabaseConfigured } from "@/config/env";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import { readAuthDb } from "@/services/auth/store";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureSuperAdminSeeded();
  const db = readAuthDb();

  return NextResponse.json({
    status: "ok",
    service: "aep-web",
    env: publicEnv.NEXT_PUBLIC_APP_ENV,
    supabaseConfigured: isSupabaseConfigured(),
    authStore: {
      users: db.users.length,
      seeded: db.seeded,
    },
    timestamp: new Date().toISOString(),
  });
}
