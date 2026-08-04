import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { communicationErrorResponse } from "@/app/api/communication/_utils";

/** Directory of users available for starting conversations */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").toLowerCase();
    const rows = readAuthDb()
      .users.filter((u) => u.id !== user.id && u.status === "active")
      .map((u) => {
        const p = toUserProfile(u);
        return {
          id: u.id,
          fullName: p.fullName || p.email,
          email: p.email,
          role: u.role,
        };
      })
      .filter(
        (u) =>
          !q ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
      .slice(0, 40);
    return NextResponse.json({ success: true, data: rows, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
