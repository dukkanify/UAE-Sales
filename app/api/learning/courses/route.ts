import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import { listMyCourses } from "@/services/learning/learning-service";
import { learningErrorResponse } from "@/app/api/learning/_utils";

export async function GET(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_ENROLLED);
    const { searchParams } = new URL(request.url);
    const data = listMyCourses(user.id, {
      q: searchParams.get("q") ?? undefined,
      sort: (searchParams.get("sort") as "title" | "progress" | "recent") ?? "recent",
      favoritedOnly: searchParams.get("favorited") === "1",
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return learningErrorResponse(error);
  }
}
