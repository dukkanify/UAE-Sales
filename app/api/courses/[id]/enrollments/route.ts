import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import {
  bulkEnroll,
  enrollStudent,
  listEnrollments,
  removeEnrollment,
  transferEnrollment,
  updateEnrollmentStatus,
} from "@/services/courses/enrollment-service";
import { courseErrorResponse } from "@/app/api/courses/_utils";
import type { EnrollmentStatus } from "@/types/courses";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id } = await params;
    return NextResponse.json({
      success: true,
      data: listEnrollments(id),
      error: null,
    });
  } catch (error) {
    return courseErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requirePermission(PERMISSIONS.COURSES_MANAGE);
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }
    const ctx = getRequestContext(request);

    if (body.action === "bulk" && Array.isArray(body.studentIds)) {
      const result = await bulkEnroll({
        courseId: id,
        studentIds: body.studentIds.map(String),
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({ success: true, data: result, error: null });
    }

    if (body.action === "update_status") {
      const enrollment = await updateEnrollmentStatus({
        id: String(body.enrollmentId ?? ""),
        status: body.status as EnrollmentStatus,
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({ success: true, data: enrollment, error: null });
    }

    if (body.action === "remove") {
      await removeEnrollment({
        id: String(body.enrollmentId ?? ""),
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({
        success: true,
        data: { id: body.enrollmentId },
        error: null,
      });
    }

    if (body.action === "transfer") {
      const enrollment = await transferEnrollment({
        id: String(body.enrollmentId ?? ""),
        targetCourseId: String(body.targetCourseId ?? ""),
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({ success: true, data: enrollment, error: null });
    }

    if (body.action === "suspend" || body.action === "resume") {
      const enrollment = await updateEnrollmentStatus({
        id: String(body.enrollmentId ?? ""),
        status: body.action === "suspend" ? "suspended" : "approved",
        actorId: user.id,
        ...ctx,
      });
      return NextResponse.json({ success: true, data: enrollment, error: null });
    }

    const enrollment = await enrollStudent({
      courseId: id,
      studentId: String(body.studentId ?? ""),
      status: (body.status as EnrollmentStatus | undefined) ?? "approved",
      notes: body.notes != null ? String(body.notes) : null,
      actorId: user.id,
      ...ctx,
    });
    return NextResponse.json({ success: true, data: enrollment, error: null }, { status: 201 });
  } catch (error) {
    return courseErrorResponse(error);
  }
}
