import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { getRequestContext, requireAuth } from "@/services/auth/guards";
import { assertPermission, hasPermission, PermissionError } from "@/services/auth/permissions";
import {
  assertScheduleAccess,
  buildSchedule,
  canBuildSchedule,
  cancelSession,
  getNextSession,
  getScheduleOverview,
  getScheduleTimeline,
  getSessionStatus,
  listScheduleSessions,
  listSessionAttendance,
  markSessionAttendance,
  queueAudienceReminders,
  rescheduleSession,
  sendImmediateAudienceReminder,
  ScheduleError,
} from "@/services/schedule/dynamic-schedule-service";
import type { ScheduleAudience, ScheduleSource } from "@/types/schedule";
import type { AttendanceStatus, RecurrenceFrequency } from "@/types/classes";

function errorResponse(error: unknown) {
  if (error instanceof ScheduleError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "Schedule request failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    assertScheduleAccess(user.role);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "overview";
    const source = (searchParams.get("source") ?? "all") as ScheduleSource | "all";
    const courseId = searchParams.get("courseId") ?? undefined;
    const instructorId = searchParams.get("instructorId") ?? undefined;
    const studentId = searchParams.get("studentId") ?? undefined;

    if (view === "overview") {
      return NextResponse.json({
        success: true,
        data: getScheduleOverview({
          userId: user.id,
          role: user.role,
          instructorId,
          studentId,
          source,
        }),
        error: null,
      });
    }

    if (view === "sessions") {
      return NextResponse.json({
        success: true,
        data: listScheduleSessions({
          userId: user.id,
          role: user.role,
          courseId,
          instructorId,
          studentId,
          source,
          status: searchParams.get("status") ?? undefined,
          from: searchParams.get("from") ?? undefined,
          to: searchParams.get("to") ?? undefined,
          limit: Number(searchParams.get("limit") ?? 100) || 100,
        }),
        error: null,
      });
    }

    if (view === "next") {
      return NextResponse.json({
        success: true,
        data: getNextSession({
          userId: user.id,
          role: user.role,
          instructorId,
          studentId,
        }),
        error: null,
      });
    }

    if (view === "timeline") {
      return NextResponse.json({
        success: true,
        data: getScheduleTimeline({
          userId: user.id,
          role: user.role,
          courseId,
          instructorId,
          studentId,
          source,
          limit: Number(searchParams.get("limit") ?? 80) || 80,
        }),
        error: null,
      });
    }

    if (view === "status") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { success: false, data: null, error: "id required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: getSessionStatus(id),
        error: null,
      });
    }

    if (view === "attendance") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { success: false, data: null, error: "id required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: listSessionAttendance(id),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown view" },
      { status: 400 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    assertScheduleAccess(user.role);
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      title?: string;
      description?: string;
      courseId?: string | null;
      lessonId?: string | null;
      lessonTitle?: string | null;
      instructorId?: string;
      studentIds?: string[];
      startsAt?: string;
      endsAt?: string;
      durationMinutes?: number;
      timezone?: string;
      maxStudents?: number;
      linkAtplLecture?: boolean;
      recurrence?: {
        frequency: RecurrenceFrequency;
        interval?: number;
        byWeekday?: number[];
        count?: number | null;
        until?: string | null;
      };
      liveClassId?: string;
      reason?: string;
      series?: boolean;
      audience?: ScheduleAudience;
      studentId?: string;
      status?: AttendanceStatus;
      joinTime?: string | null;
      leaveTime?: string | null;
      notes?: string | null;
      mode?: "queue" | "immediate";
    };
    const ctx = getRequestContext(request);
    const action = body.action;

    if (action === "build") {
      if (!canBuildSchedule(user.role)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
      if (user.role === ROLES.INSTRUCTOR) {
        assertPermission(user, PERMISSIONS.SCHEDULE_OWN);
      } else if (user.role === ROLES.CHIEF_GROUND_INSTRUCTOR) {
        assertPermission(user, PERMISSIONS.SCHEDULE_MANAGE_ALL);
      } else {
        assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
      }
      if (!body.title || !body.startsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "title and startsAt required" },
          { status: 400 },
        );
      }
      const instructorId = body.instructorId ?? (user.role === ROLES.INSTRUCTOR ? user.id : null);
      if (!instructorId) {
        return NextResponse.json(
          { success: false, data: null, error: "instructorId required" },
          { status: 400 },
        );
      }
      if (user.role === ROLES.INSTRUCTOR && instructorId !== user.id) {
        return NextResponse.json(
          { success: false, data: null, error: "Instructors may only schedule themselves" },
          { status: 403 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await buildSchedule({
          title: body.title,
          description: body.description,
          courseId: body.courseId,
          lessonId: body.lessonId,
          lessonTitle: body.lessonTitle,
          instructorId,
          studentIds: body.studentIds,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          durationMinutes: body.durationMinutes,
          timezone: body.timezone,
          maxStudents: body.maxStudents,
          linkAtplLecture: body.linkAtplLecture,
          recurrence: body.recurrence,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "reschedule") {
      if (!canBuildSchedule(user.role)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
      if (!body.liveClassId || !body.startsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "liveClassId and startsAt required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await rescheduleSession({
          liveClassId: body.liveClassId,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          durationMinutes: body.durationMinutes,
          actorId: user.id,
          actorRole: user.role,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "cancel") {
      if (!canBuildSchedule(user.role)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
      if (!body.liveClassId) {
        return NextResponse.json(
          { success: false, data: null, error: "liveClassId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await cancelSession({
          liveClassId: body.liveClassId,
          reason: body.reason,
          series: Boolean(body.series),
          actorId: user.id,
          actorRole: user.role,
          ...ctx,
        }),
        error: null,
      });
    }

    if (
      action === "remind_students" ||
      action === "remind_instructors" ||
      action === "remind_all"
    ) {
      if (!canBuildSchedule(user.role)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
      if (!body.liveClassId) {
        return NextResponse.json(
          { success: false, data: null, error: "liveClassId required" },
          { status: 400 },
        );
      }
      const audience: ScheduleAudience =
        action === "remind_students"
          ? "student"
          : action === "remind_instructors"
            ? "instructor"
            : "all";
      if (body.mode === "queue") {
        return NextResponse.json({
          success: true,
          data: await queueAudienceReminders(body.liveClassId, audience),
          error: null,
        });
      }
      return NextResponse.json({
        success: true,
        data: await sendImmediateAudienceReminder({
          liveClassId: body.liveClassId,
          audience,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (action === "attendance") {
      if (
        !hasPermission(user.role, PERMISSIONS.ATTENDANCE_MANAGE) &&
        !hasPermission(user.role, PERMISSIONS.CLASSES_MANAGE)
      ) {
        throw new PermissionError("You do not have permission to manage attendance", 403);
      }
      if (!body.liveClassId || !body.studentId || !body.status) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: "liveClassId, studentId, and status required",
          },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await markSessionAttendance({
          liveClassId: body.liveClassId,
          studentId: body.studentId,
          status: body.status,
          joinTime: body.joinTime,
          leaveTime: body.leaveTime,
          notes: body.notes,
          actorId: user.id,
          actorRole: user.role,
        }),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
