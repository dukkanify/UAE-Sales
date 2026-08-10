import { NextResponse } from "next/server";

import { requireAuth, getRequestContext, authErrorResponse } from "@/services/auth/guards";
import { revokeUserSession } from "@/services/auth/session-service";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requireAuth();
    const { id } = await params;
    const ctx = getRequestContext(request);
    const result = await revokeUserSession({
      userId: user.id,
      sessionId: id,
      actorId: user.id,
      ...ctx,
    });

    if (!result.revoked) {
      return NextResponse.json(
        { success: false, data: null, error: "Session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}
