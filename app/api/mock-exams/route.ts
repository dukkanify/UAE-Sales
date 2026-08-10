import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import {
  bookMockExam,
  completeMockExamSession,
  confirmMockExamPayment,
  getMockExamAdminOverview,
  getMockExamCatalog,
  getMockExamSession,
  listMockExamSessions,
  updateMockExamSettings,
} from "@/services/mock-exams/booking-service";
import { getMockExamSlots, listMockExaminers } from "@/services/mock-exams/availability-service";
import { MockExamError, quoteMockExam } from "@/services/mock-exams/pricing-service";

function errorResponse(error: unknown) {
  if (error instanceof MockExamError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "Mock exam request failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "sessions";

    if (view === "catalog") {
      return NextResponse.json({ success: true, data: getMockExamCatalog(), error: null });
    }

    if (view === "slots") {
      const date = searchParams.get("date");
      const examinerId = searchParams.get("examinerId");
      const examTypeId = searchParams.get("examTypeId");
      if (!date || !examinerId || !examTypeId) {
        return NextResponse.json(
          { success: false, data: null, error: "date, examinerId, examTypeId required" },
          { status: 400 },
        );
      }
      const extras = searchParams.get("extras");
      return NextResponse.json({
        success: true,
        data: getMockExamSlots({
          date,
          examinerId,
          examTypeId,
          selectedExtraFeeIds: extras ? extras.split(",").filter(Boolean) : [],
        }),
        error: null,
      });
    }

    if (view === "quote") {
      const examTypeId = searchParams.get("examTypeId");
      const startsAt = searchParams.get("startsAt");
      if (!examTypeId || !startsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "examTypeId and startsAt required" },
          { status: 400 },
        );
      }
      const extras = searchParams.get("extras");
      return NextResponse.json({
        success: true,
        data: quoteMockExam({
          examTypeId,
          startsAt,
          selectedExtraFeeIds: extras ? extras.split(",").filter(Boolean) : [],
        }),
        error: null,
      });
    }

    if (view === "examiners") {
      return NextResponse.json({ success: true, data: listMockExaminers(), error: null });
    }

    if (view === "admin") {
      await requirePermission(PERMISSIONS.MOCK_EXAMS_CONFIG);
      return NextResponse.json({ success: true, data: getMockExamAdminOverview(), error: null });
    }

    if (view === "session") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { success: false, data: null, error: "id required" },
          { status: 400 },
        );
      }
      const session = getMockExamSession(id);
      if (!session) {
        return NextResponse.json(
          { success: false, data: null, error: "Not found" },
          { status: 404 },
        );
      }
      if (
        user.role === ROLES.STUDENT &&
        session.studentId !== user.id &&
        !assertCanManage(user.role)
      ) {
        throw new PermissionError("Forbidden", 403);
      }
      return NextResponse.json({ success: true, data: session, error: null });
    }

    // Default sessions list
    if (user.role === ROLES.STUDENT) {
      assertPermission(user, PERMISSIONS.MOCK_EXAMS_OWN);
      return NextResponse.json({
        success: true,
        data: listMockExamSessions({ studentId: user.id }),
        error: null,
      });
    }
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.MOCK_EXAMS_MANAGE);
      return NextResponse.json({
        success: true,
        data: listMockExamSessions({ examinerId: user.id }),
        error: null,
      });
    }
    assertPermission(user, PERMISSIONS.MOCK_EXAMS_MANAGE);
    return NextResponse.json({
      success: true,
      data: listMockExamSessions({
        studentId: searchParams.get("studentId") ?? undefined,
        examinerId: searchParams.get("examinerId") ?? undefined,
        status: searchParams.get("status") ?? undefined,
      }),
      error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function assertCanManage(role: string) {
  return (
    role === ROLES.ADMIN ||
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CHIEF_GROUND_INSTRUCTOR ||
    role === ROLES.INSTRUCTOR
  );
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      examinerId?: string;
      examTypeId?: string;
      startsAt?: string;
      selectedExtraFeeIds?: string[];
      studentId?: string;
      sessionId?: string;
      markPaid?: boolean;
      scorePercent?: number;
      passed?: boolean;
      notes?: string | null;
      settings?: Record<string, unknown>;
    };
    const action = body.action;

    if (action === "book") {
      assertPermission(user, PERMISSIONS.MOCK_EXAMS_OWN);
      if (!body.examinerId || !body.examTypeId || !body.startsAt) {
        return NextResponse.json(
          { success: false, data: null, error: "examinerId, examTypeId, startsAt required" },
          { status: 400 },
        );
      }
      let studentId = user.id;
      if (user.role !== ROLES.STUDENT) {
        assertPermission(user, PERMISSIONS.MOCK_EXAMS_MANAGE);
        if (!body.studentId) {
          return NextResponse.json(
            { success: false, data: null, error: "studentId required" },
            { status: 400 },
          );
        }
        studentId = body.studentId;
      } else {
        assertPermission(user, PERMISSIONS.MOCK_EXAMS_OWN);
      }
      return NextResponse.json({
        success: true,
        data: await bookMockExam({
          studentId,
          examinerId: body.examinerId,
          examTypeId: body.examTypeId,
          startsAt: body.startsAt,
          selectedExtraFeeIds: body.selectedExtraFeeIds,
          // Demo flow: student booking confirms + provisions Zoom immediately.
          markPaid: body.markPaid ?? true,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (action === "confirm_payment") {
      assertPermission(user, PERMISSIONS.MOCK_EXAMS_MANAGE);
      if (!body.sessionId) {
        return NextResponse.json(
          { success: false, data: null, error: "sessionId required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await confirmMockExamPayment(body.sessionId, user.id),
        error: null,
      });
    }

    if (action === "complete") {
      assertPermission(user, PERMISSIONS.MOCK_EXAMS_MANAGE);
      if (!body.sessionId || body.scorePercent == null || body.passed == null) {
        return NextResponse.json(
          { success: false, data: null, error: "sessionId, scorePercent, passed required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await completeMockExamSession({
          sessionId: body.sessionId,
          scorePercent: Number(body.scorePercent),
          passed: Boolean(body.passed),
          notes: body.notes,
          actorId: user.id,
        }),
        error: null,
      });
    }

    if (action === "update_settings") {
      await requirePermission(PERMISSIONS.MOCK_EXAMS_CONFIG);
      return NextResponse.json({
        success: true,
        data: updateMockExamSettings(body.settings ?? {}),
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
