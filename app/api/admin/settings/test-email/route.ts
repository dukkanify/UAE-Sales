import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { testEmailTemplate } from "@/services/settings/email-templates";
import { isEmailDeliveryConfigured, sendEmail } from "@/services/email/mailer";

/**
 * Sends a branded test email via SMTP when configured, otherwise records it
 * in the durable outbox so Super Admins can verify the notification path.
 */
export async function POST(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_EMAIL);
    const body = (await request.json().catch(() => null)) as { to?: string } | null;
    const settings = getPlatformSettings();
    const to = (
      body?.to ||
      settings.general.supportEmail ||
      settings.email.senderEmail ||
      ""
    ).trim();
    const template = testEmailTemplate();
    const configured = isEmailDeliveryConfigured();

    if (!to) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Add a recipient or configure support/sender email in settings.",
      });
    }

    const result = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      meta: { kind: "test", system: true },
    });

    return NextResponse.json({
      success: result.success,
      data: {
        queued: result.success,
        delivered: result.delivered,
        mode: result.mode,
        outboxId: result.outboxId,
        to,
        subject: template.subject,
        previewHtml: template.html,
        configured,
        message: result.delivered
          ? `Test email delivered to ${to} via SMTP.`
          : result.mode === "outbox"
            ? `Test email saved to outbox (${result.outboxId}). Configure SMTP in Email settings to deliver to real inboxes.`
            : result.error || "Failed to send test email.",
        provider: settings.email.provider,
        error: result.error,
      },
      error: result.success ? null : result.error,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
