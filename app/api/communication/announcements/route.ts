import { NextResponse } from "next/server";

import { requireAuth, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureCommunicationSeeded } from "@/services/communication/seed";
import {
  listAnnouncements,
  publishAnnouncement,
} from "@/services/communication/announcement-service";
import { communicationErrorResponse } from "@/app/api/communication/_utils";
import type { AnnouncementTarget } from "@/types/communication";

export async function GET() {
  try {
    ensureCommunicationSeeded();
    const user = await requireAuth();
    const data = listAnnouncements({ forUser: user });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureCommunicationSeeded();
    const user = await requirePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE);
    const body = (await request.json().catch(() => null)) as {
      title?: string;
      bodyHtml?: string;
      target?: AnnouncementTarget;
      targetId?: string;
      scheduledAt?: string;
    } | null;

    const data = await publishAnnouncement({
      user,
      title: body?.title ?? "Announcement",
      bodyHtml: body?.bodyHtml ?? "",
      target: body?.target ?? "platform",
      targetId: body?.targetId,
      scheduledAt: body?.scheduledAt,
    });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return communicationErrorResponse(error);
  }
}
