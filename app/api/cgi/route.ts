import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRequestContext, requirePermission } from "@/services/auth/guards";
import { PermissionError } from "@/services/auth/permissions";
import {
  addOversightNote,
  changeSubjectInstructor,
  chooseFirstSubject,
  distributeLecture,
  distributeSubjects,
  getCgiDashboardSnapshot,
  getJourneySettings,
  listAllInstructors,
  listAtplCourses,
  listAtplStudents,
  listLectureAssignments,
  listOversightNotes,
  listStudentSubjectPlan,
  rescheduleAtplClass,
  setDefaultFirstSubject,
  CgiError,
} from "@/services/cgi/journey-service";

function cgiErrorResponse(error: unknown) {
  if (error instanceof CgiError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "CGI request failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.DASHBOARD_CGI);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "dashboard";

    if (view === "settings") {
      return NextResponse.json({ success: true, data: getJourneySettings(), error: null });
    }
    if (view === "subjects") {
      return NextResponse.json({ success: true, data: listAtplCourses(), error: null });
    }
    if (view === "students") {
      return NextResponse.json({ success: true, data: listAtplStudents(), error: null });
    }
    if (view === "instructors") {
      await requirePermission(PERMISSIONS.INSTRUCTORS_FOLLOW);
      return NextResponse.json({ success: true, data: listAllInstructors(), error: null });
    }
    if (view === "lectures") {
      return NextResponse.json({
        success: true,
        data: listLectureAssignments({
          instructorId: searchParams.get("instructorId") ?? undefined,
          studentId: searchParams.get("studentId") ?? undefined,
          courseId: searchParams.get("courseId") ?? undefined,
        }),
        error: null,
      });
    }
    if (view === "plan") {
      const studentId = searchParams.get("studentId");
      if (!studentId) {
        return NextResponse.json(
          { success: false, data: null, error: "studentId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: listStudentSubjectPlan(studentId),
        error: null,
      });
    }
    if (view === "notes") {
      return NextResponse.json({
        success: true,
        data: listOversightNotes(searchParams.get("targetUserId") ?? undefined),
        error: null,
      });
    }

    return NextResponse.json({ success: true, data: getCgiDashboardSnapshot(), error: null });
  } catch (error) {
    return cgiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.DASHBOARD_CGI);
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      courseId?: string;
      courseIds?: string[];
      firstCourseId?: string | null;
      studentId?: string;
      instructorId?: string;
      lessonId?: string;
      lessonTitle?: string;
      scheduledAt?: string | null;
      notes?: string | null;
      liveClassId?: string;
      startsAt?: string;
      endsAt?: string;
      targetType?: "student" | "instructor";
      targetUserId?: string;
      body?: string;
    };
    const ctx = getRequestContext(request);
    const action = body.action;

    if (action === "set_default_first_subject") {
      await requirePermission(PERMISSIONS.ATPL_FIRST_SUBJECT);
      if (!body.courseId) {
        return NextResponse.json(
          { success: false, data: null, error: "courseId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: setDefaultFirstSubject({ courseId: body.courseId, actorId: user.id }),
        error: null,
      });
    }

    if (action === "distribute_subjects") {
      await requirePermission(PERMISSIONS.SUBJECTS_DISTRIBUTE);
      if (!body.studentId || !Array.isArray(body.courseIds) || !body.courseIds.length) {
        return NextResponse.json(
          { success: false, data: null, error: "studentId and courseIds required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: distributeSubjects({
          studentId: body.studentId,
          courseIds: body.courseIds,
          firstCourseId: body.firstCourseId,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (action === "choose_first_subject") {
      await requirePermission(PERMISSIONS.ATPL_FIRST_SUBJECT);
      if (!body.studentId || !body.courseId) {
        return NextResponse.json(
          { success: false, data: null, error: "studentId and courseId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await chooseFirstSubject({
          studentId: body.studentId,
          courseId: body.courseId,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (action === "change_instructor") {
      await requirePermission(PERMISSIONS.INSTRUCTORS_ASSIGN);
      if (!body.courseId || !body.instructorId) {
        return NextResponse.json(
          { success: false, data: null, error: "courseId and instructorId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await changeSubjectInstructor({
          courseId: body.courseId,
          instructorId: body.instructorId,
          studentId: body.studentId,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "distribute_lecture") {
      await requirePermission(PERMISSIONS.LECTURES_DISTRIBUTE);
      if (!body.courseId || !body.lessonId || !body.instructorId) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: "courseId, lessonId, and instructorId required",
          },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await distributeLecture({
          courseId: body.courseId,
          lessonId: body.lessonId,
          lessonTitle: body.lessonTitle ?? "Lecture",
          instructorId: body.instructorId,
          studentId: body.studentId,
          scheduledAt: body.scheduledAt,
          notes: body.notes,
          actorId: user.id,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "reschedule_class") {
      await requirePermission(PERMISSIONS.SCHEDULE_MANAGE_ALL);
      if (!body.liveClassId || !body.startsAt || !body.endsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "liveClassId, startsAt, and endsAt required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await rescheduleAtplClass({
          liveClassId: body.liveClassId,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          actorId: user.id,
          actorRole: user.role,
          ...ctx,
        }),
        error: null,
      });
    }

    if (action === "add_note") {
      if (!body.targetType || !body.targetUserId || !body.body) {
        return NextResponse.json(
          { success: false, data: null, error: "targetType, targetUserId, and body required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: addOversightNote({
          targetType: body.targetType,
          targetUserId: body.targetUserId,
          body: body.body,
          authorId: user.id,
        }),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return cgiErrorResponse(error);
  }
}
