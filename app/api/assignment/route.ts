import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { hasPermission, PermissionError } from "@/services/auth/permissions";
import {
  addAvailabilityBlock,
  AssignmentError,
  listAvailabilityBlocks,
  listAvailabilityWindows,
  setAvailabilityWindows,
} from "@/services/assignment/availability-service";
import { detectInstructorConflicts } from "@/services/assignment/conflict-service";
import {
  assignInstructorEngine,
  getAssignmentEngineSnapshot,
  getInstructorCalendar,
  listAssignmentRequests,
  listWaitingQueue,
  processWaitingQueue,
  reassignInstructorEngine,
  scheduleAssignmentSession,
} from "@/services/assignment/engine";

function errorResponse(error: unknown) {
  if (error instanceof AssignmentError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "Assignment engine failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

async function requireAssignmentAccess() {
  const user = await requirePermission(PERMISSIONS.INSTRUCTORS_ASSIGN).catch(async (err) => {
    if (err instanceof PermissionError) {
      return requirePermission(PERMISSIONS.SCHEDULE_MANAGE_ALL);
    }
    throw err;
  });
  return user;
}

export async function GET(request: Request) {
  try {
    await requireAssignmentAccess();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "dashboard";

    if (view === "requests") {
      return NextResponse.json({
        success: true,
        data: listAssignmentRequests({
          instructorId: searchParams.get("instructorId") ?? undefined,
          status: searchParams.get("status") ?? undefined,
          courseId: searchParams.get("courseId") ?? undefined,
        }),
        error: null,
      });
    }
    if (view === "queue") {
      return NextResponse.json({
        success: true,
        data: listWaitingQueue(searchParams.get("instructorId") ?? undefined),
        error: null,
      });
    }
    if (view === "availability") {
      const instructorId = searchParams.get("instructorId");
      if (!instructorId) {
        return NextResponse.json(
          { success: false, data: null, error: "instructorId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          windows: listAvailabilityWindows(instructorId),
          blocks: listAvailabilityBlocks(instructorId),
        },
        error: null,
      });
    }
    if (view === "calendar") {
      const instructorId = searchParams.get("instructorId");
      if (!instructorId) {
        return NextResponse.json(
          { success: false, data: null, error: "instructorId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: getInstructorCalendar(instructorId, {
          from: searchParams.get("from") ?? undefined,
          to: searchParams.get("to") ?? undefined,
        }),
        error: null,
      });
    }
    if (view === "conflicts") {
      const instructorId = searchParams.get("instructorId");
      const startsAt = searchParams.get("startsAt");
      const endsAt = searchParams.get("endsAt");
      if (!instructorId || !startsAt || !endsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "instructorId, startsAt, endsAt required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: detectInstructorConflicts({ instructorId, startsAt, endsAt }),
        error: null,
      });
    }

    return NextResponse.json({ success: true, data: getAssignmentEngineSnapshot(), error: null });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAssignmentAccess();
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      courseId?: string;
      instructorId?: string;
      studentId?: string | null;
      lessonId?: string | null;
      lessonTitle?: string;
      preferredStartsAt?: string | null;
      startsAt?: string;
      endsAt?: string;
      durationMinutes?: number;
      scheduleNow?: boolean;
      autoZoom?: boolean;
      requestId?: string;
      moveFutureClasses?: boolean;
      windows?: Array<{ weekday: number; startTime: string; endTime: string; timezone?: string }>;
      reason?: string;
    };
    const ctx = getRequestContext(request);
    const action = body.action;

    if (action === "assign") {
      if (!body.courseId || !body.instructorId) {
        return NextResponse.json(
          { success: false, data: null, error: "courseId and instructorId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await assignInstructorEngine({
          courseId: body.courseId,
          instructorId: body.instructorId,
          studentId: body.studentId,
          lessonId: body.lessonId,
          lessonTitle: body.lessonTitle,
          preferredStartsAt: body.preferredStartsAt,
          durationMinutes: body.durationMinutes,
          autoZoom: body.autoZoom,
          scheduleNow: body.scheduleNow,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "reassign") {
      if (!body.courseId || !body.instructorId) {
        return NextResponse.json(
          { success: false, data: null, error: "courseId and instructorId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await reassignInstructorEngine({
          courseId: body.courseId,
          instructorId: body.instructorId,
          studentId: body.studentId,
          moveFutureClasses: body.moveFutureClasses,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "schedule") {
      return NextResponse.json({
        success: true,
        data: await scheduleAssignmentSession({
          requestId: body.requestId,
          createRequest:
            !body.requestId && body.courseId && body.instructorId
              ? {
                  courseId: body.courseId,
                  instructorId: body.instructorId,
                  lessonId: body.lessonId,
                  lessonTitle: body.lessonTitle,
                  preferredStartsAt: body.preferredStartsAt ?? body.startsAt,
                  durationMinutes: body.durationMinutes,
                  studentId: body.studentId,
                  actorId: user.id,
                  autoZoom: body.autoZoom,
                }
              : undefined,
          startsAt: body.startsAt ?? body.preferredStartsAt ?? undefined,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (action === "set_availability") {
      if (!body.instructorId || !Array.isArray(body.windows)) {
        return NextResponse.json(
          { success: false, data: null, error: "instructorId and windows required" },
          { status: 400 },
        );
      }
      // Instructors may edit own availability with schedule.own
      if (
        user.role === "instructor" &&
        user.id !== body.instructorId &&
        !hasPermission(user.role, PERMISSIONS.INSTRUCTORS_ASSIGN)
      ) {
        throw new PermissionError("Cannot edit another instructor's availability", 403);
      }
      return NextResponse.json({
        success: true,
        data: setAvailabilityWindows({
          instructorId: body.instructorId,
          windows: body.windows,
        }),
        error: null,
      });
    }

    if (action === "add_block") {
      if (!body.instructorId || !body.startsAt || !body.endsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "instructorId, startsAt, endsAt required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: addAvailabilityBlock({
          instructorId: body.instructorId,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          reason: body.reason,
        }),
        error: null,
      });
    }

    if (action === "process_queue") {
      await requirePermission(PERMISSIONS.SCHEDULE_MANAGE_ALL).catch(async () =>
        requirePermission(PERMISSIONS.INSTRUCTORS_ASSIGN),
      );
      return NextResponse.json({
        success: true,
        data: await processWaitingQueue(user.id),
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
