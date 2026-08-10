import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission, PermissionError } from "@/services/auth/permissions";
import {
  configureAutomationEvent,
  dispatchEmailEvent,
  dispatchRoleAlert,
  EmailAutomationError,
  getEmailAutomationOverview,
} from "@/services/email/automation-service";
import { EMAIL_AUTOMATION_EVENTS, type EmailAutomationEvent } from "@/types/email-automation";

function errorResponse(error: unknown) {
  if (error instanceof EmailAutomationError || error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : "Email automation failed";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.SYSTEM_EMAIL);
    return NextResponse.json({
      success: true,
      data: getEmailAutomationOverview(),
      error: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    assertPermission(user, PERMISSIONS.SYSTEM_EMAIL);

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      event?: string;
      enabled?: boolean;
      to?: string;
      userIds?: string[];
      subject?: string;
      title?: string;
      detail?: string;
      data?: Record<string, string | number | boolean | null | undefined>;
    };

    if (body.action === "configure") {
      if (!body.event || typeof body.enabled !== "boolean") {
        return NextResponse.json(
          { success: false, data: null, error: "event and enabled required" },
          { status: 400 },
        );
      }
      if (!(EMAIL_AUTOMATION_EVENTS as readonly string[]).includes(body.event)) {
        return NextResponse.json(
          { success: false, data: null, error: "Unknown event" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: configureAutomationEvent(body.event as EmailAutomationEvent, body.enabled),
        error: null,
      });
    }

    if (body.action === "dispatch") {
      if (!body.event) {
        return NextResponse.json(
          { success: false, data: null, error: "event required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await dispatchEmailEvent({
          event: body.event as EmailAutomationEvent,
          to: body.to,
          userIds: body.userIds,
          subject: body.subject,
          data: {
            title: body.title ?? "",
            detail: body.detail ?? "Manual automation dispatch from admin console.",
            ...(body.data ?? {}),
          },
          actorId: user.id,
          system: true,
        }),
        error: null,
      });
    }

    if (body.action === "role_alert") {
      const event =
        body.event === "instructor_alert" || body.event === "student_alert"
          ? body.event
          : "admin_alert";
      if (!body.title || !body.detail) {
        return NextResponse.json(
          { success: false, data: null, error: "title and detail required" },
          { status: 400 },
        );
      }
      return NextResponse.json({
        success: true,
        data: await dispatchRoleAlert({
          event,
          title: body.title,
          detail: body.detail,
          userIds: body.userIds,
          actorId: user.id,
          system: true,
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
