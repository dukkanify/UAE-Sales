import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { assertOwnOrManage } from "@/services/certificates/access";
import { generateTranscript } from "@/services/certificates/transcript-service";
import {
  exportTranscriptCsv,
  exportTranscriptHtml,
} from "@/services/certificates/export-service";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const studentId =
      searchParams.get("studentId") ||
      (user.role === ROLES.STUDENT ? user.id : null);
    if (!studentId) {
      return NextResponse.json(
        { success: false, data: null, error: "studentId required" },
        { status: 400 },
      );
    }
    assertOwnOrManage(user, studentId);
    const format = searchParams.get("format") ?? "json";

    if (format === "csv") {
      const csv = await exportTranscriptCsv(user, studentId);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="transcript.csv"',
        },
      });
    }
    if (format === "pdf" || format === "html") {
      const html = await exportTranscriptHtml(user, studentId);
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (user.role === ROLES.STUDENT) {
      await requirePermission(PERMISSIONS.CERTIFICATES_OWN);
    }
    const data = await generateTranscript(user, studentId);
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}
