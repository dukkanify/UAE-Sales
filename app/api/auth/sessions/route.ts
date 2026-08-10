import { NextResponse } from "next/server";

import { requireAuth, getRequestContext, authErrorResponse } from "@/services/auth/guards";
import { listUserSessions, revokeOtherUserSessions } from "@/services/auth/session-service";
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

/** Revoke all other sessions for the current user. */
export async function DELETE(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requireAuth();
    const ctx = getRequestContext(request);
    const count = await revokeOtherUserSessions({
      userId: user.id,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({
      success: true,
      data: { revoked: count },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
