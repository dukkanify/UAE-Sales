import { NextResponse } from "next/server";

import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { communicationErrorResponse } from "@/app/api/communication/_utils";

/** Directory of users available for starting conversations — scoped by role. */
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").toLowerCase();
    const staffRoles = new Set<string>([
      ROLES.INSTRUCTOR,
      ROLES.CHIEF_GROUND_INSTRUCTOR,
      ROLES.ADMIN,
      ROLES.SUPER_ADMIN,
    ]);

    const rows = readAuthDb()
      .users.filter((u) => {
        if (u.id === user.id || u.status !== "active") return false;
        // Students only message faculty/staff — never the full user directory.
        if (user.role === ROLES.STUDENT) return staffRoles.has(u.role);
        // Instructors / CGI can reach students + staff.
        if (
          user.role === ROLES.INSTRUCTOR ||
          user.role === ROLES.CHIEF_GROUND_INSTRUCTOR
        ) {
          return u.role === ROLES.STUDENT || staffRoles.has(u.role);
        }
        // Admin / super_admin: full directory.
        return true;
      })
      .map((u) => {
        const p = toUserProfile(u);
        return {
          id: u.id,
          fullName: p.fullName || p.email,
          // Hide emails from students; staff/admin still see them for ops.
          email: user.role === ROLES.STUDENT ? "" : p.email,
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
