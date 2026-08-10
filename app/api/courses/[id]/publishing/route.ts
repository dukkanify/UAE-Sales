import { NextResponse } from "next/server";

import { ROLES } from "@/constants/roles";
import { getRequestContext, requireAuth } from "@/services/auth/guards";
import { PermissionError } from "@/services/auth/permissions";
import { updateCoursePublishing } from "@/services/courses/course-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";

type Params = { params: Promise<{ id: string }> };

/** Super Admin only — course publishing & visibility (CR001). */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    if (user.role !== ROLES.SUPER_ADMIN) {
      throw new PermissionError("Only Super Admin can manage course publishing", 403);
    }

    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }

    const ctx = getRequestContext(request);
    const course = await updateCoursePublishing({
      id,
      patch: {
        status: body.status != null ? String(body.status) : undefined,
        deliveryType: body.deliveryType != null ? String(body.deliveryType) : undefined,
        enrollmentOpen: typeof body.enrollmentOpen === "boolean" ? body.enrollmentOpen : undefined,
        hidden: typeof body.hidden === "boolean" ? body.hidden : undefined,
        scheduledPublishAt:
          body.scheduledPublishAt === undefined
            ? undefined
            : ((body.scheduledPublishAt as string | null) ?? null),
      },
      actorId: user.id,
      ...ctx,
    });

    return NextResponse.json({ success: true, data: course, error: null });
  } catch (error) {
    return courseErrorResponse(error);
  }
}
