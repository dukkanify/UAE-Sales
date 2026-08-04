import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { getRequestContext, requireAuth, requirePermission } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import { createLiveClass, listLiveClasses } from "@/services/classes/class-service";
import { classErrorResponse } from "@/app/api/classes/_utils";
import { parsePagination } from "@/lib/api/envelope";
import type { ClassFilters, LiveClassStatus } from "@/types/classes";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const { searchParams } = url;
    const p = parsePagination(url);
    const filters: ClassFilters = {
      q: p.q,
      courseId: searchParams.get("courseId") ?? undefined,
      instructorId: searchParams.get("instructorId") ?? undefined,
      status: (searchParams.get("status") as ClassFilters["status"]) ?? "all",
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      page: p.page,
      pageSize: p.pageSize,
    };

    if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    } else if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
      filters.instructorId = user.id;
    } else {
      assertPermission(user, PERMISSIONS.ZOOM_CLASSES);
      // Student list filtered in calendar/join; return participant classes via filter from
      const { readClassesDb } = await import("@/services/classes/store");
      const ids = new Set(
        readClassesDb()
          .participants.filter((p) => p.userId === user.id)
          .map((p) => p.liveClassId),
      );
      const all = listLiveClasses({ ...filters, pageSize: 200 });
      const data = all.data.filter((c) => ids.has(c.id));
      return NextResponse.json({
        success: true,
        data: { ...all, data, total: data.length },
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: listLiveClasses(filters),
      error: null,
    });
  } catch (error) {
    return classErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
    } else {
      await requirePermission(PERMISSIONS.CLASSES_MANAGE);
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }

    const ctx = getRequestContext(request);
    const instructorId =
      user.role === ROLES.INSTRUCTOR ? user.id : String(body.instructorId ?? user.id);

    const created = await createLiveClass({
      title: String(body.title ?? ""),
      description: body.description != null ? String(body.description) : undefined,
      courseId: (body.courseId as string | null | undefined) ?? null,
      moduleId: (body.moduleId as string | null | undefined) ?? null,
      lessonId: (body.lessonId as string | null | undefined) ?? null,
      instructorId,
      assistantInstructorId: (body.assistantInstructorId as string | null | undefined) ?? null,
      startsAt: String(body.startsAt ?? ""),
      endsAt: body.endsAt != null ? String(body.endsAt) : undefined,
      durationMinutes: body.durationMinutes != null ? Number(body.durationMinutes) : undefined,
      timezone: body.timezone != null ? String(body.timezone) : undefined,
      maxStudents: body.maxStudents != null ? Number(body.maxStudents) : undefined,
      meetingType: body.meetingType as "meeting" | "webinar" | undefined,
      status: body.status as LiveClassStatus | undefined,
      waitingRoom: body.waitingRoom != null ? Boolean(body.waitingRoom) : undefined,
      recurrence: body.recurrence as CreateRecurrence | undefined,
      enrollStudentIds: Array.isArray(body.enrollStudentIds)
        ? body.enrollStudentIds.map(String)
        : undefined,
      actorId: user.id,
      ...ctx,
    });

    return NextResponse.json({ success: true, data: created, error: null }, { status: 201 });
  } catch (error) {
    return classErrorResponse(error);
  }
}

type CreateRecurrence = {
  frequency: "once" | "daily" | "weekly" | "monthly";
  interval?: number;
  byWeekday?: number[];
  count?: number | null;
  until?: string | null;
};
