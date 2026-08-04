import { NextResponse } from "next/server";

import { getCurrentSession } from "@/services/auth/auth-service";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";

export async function GET() {
  ensureSuperAdminSeeded();
  await ensureCsrfToken();
  const session = await getCurrentSession();

  return NextResponse.json({
    success: true,
    data: {
      user: session.user,
      permissions: session.permissions,
      isAuthenticated: Boolean(session.user),
    },
    error: null,
  });
}
