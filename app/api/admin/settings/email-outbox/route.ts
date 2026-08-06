import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { listOutboundEmails } from "@/services/email/outbox";
import { isEmailDeliveryConfigured } from "@/services/email/mailer";

/** Super Admin: inspect recent outbound emails (SMTP + outbox). */
export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_EMAIL);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30)));
    const messages = listOutboundEmails(limit).map((m) => ({
      id: m.id,
      to: m.to,
      subject: m.subject,
      mode: m.mode,
      provider: m.provider,
      error: m.error ?? null,
      createdAt: m.createdAt,
      meta: m.meta ?? {},
      // Truncate HTML for list views
      previewText: m.text.slice(0, 280),
    }));

    return NextResponse.json({
      success: true,
      data: {
        smtpConfigured: isEmailDeliveryConfigured(),
        messages,
      },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
