import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { testEmailTemplate } from "@/services/settings/email-templates";

/**
 * Test email endpoint — validates configuration shape and returns a rendered
 * branded template. Live SMTP send requires provider credentials to be set.
 */
export async function POST(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_EMAIL);
    const body = (await request.json().catch(() => null)) as { to?: string } | null;
    const settings = getPlatformSettings();
    const to = body?.to || settings.general.supportEmail;
    const template = testEmailTemplate();

    const configured =
      settings.email.provider !== "smtp"
        ? true
        : Boolean(settings.email.smtpHost && settings.email.senderEmail);

    return NextResponse.json({
      success: true,
      data: {
        queued: configured,
        delivered: false,
        to,
        subject: template.subject,
        previewHtml: template.html,
        message: configured
          ? "Email template rendered. Connect a live SMTP/provider to deliver."
          : "SMTP host or sender email is missing. Configure Email settings first.",
        provider: settings.email.provider,
      },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
