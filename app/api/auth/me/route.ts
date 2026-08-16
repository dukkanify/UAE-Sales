import { NextResponse } from "next/server";

import { getCurrentSession } from "@/services/auth/auth-service";
import { ensureCsrfToken } from "@/lib/security/cookies";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";

export async function GET() {
  ensureSuperAdminSeeded();
  await ensureCsrfToken();
  const session = await getCurrentSession();

  // #region agent log
  {
    const { agentLog } = await import("@/lib/debug/agent-log");
    agentLog({
      hypothesisId: "D",
      location: "api/auth/me/route.ts:GET",
      message: "/api/auth/me response",
      data: {
        userId: session.user?.id ?? null,
        email: session.user?.email ?? null,
        role: session.user?.role ?? null,
        permissionCount: session.permissions.length,
      },
    });
  }
  // #endregion

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
