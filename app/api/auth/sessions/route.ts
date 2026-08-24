import { NextResponse } from "next/server";

import { requireAuth, getRequestContext, authErrorResponse } from "@/services/auth/guards";
import {
  listUserSessions,
  revokeAllUserSessions,
  revokeOtherUserSessions,
} from "@/services/auth/session-service";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

export async function GET() {
  try {
    const user = await requireAuth();
    const sessions = await listUserSessions(user.id);
    return NextResponse.json({ success: true, data: { sessions }, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * DELETE /api/auth/sessions
 * - default: revoke all other sessions
 * - ?scope=all: logout everywhere (revoke all + clear cookies)
 */
export async function DELETE(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requireAuth();
    const ctx = getRequestContext(request);
    const scope = new URL(request.url).searchParams.get("scope");

    if (scope === "all") {
      const count = await revokeAllUserSessions({
        userId: user.id,
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({
        success: true,
        data: { revoked: count, scope: "all" },
        error: null,
      });
    }

    const count = await revokeOtherUserSessions({
      userId: user.id,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({
      success: true,
      data: { revoked: count, scope: "others" },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
