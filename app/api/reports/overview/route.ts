import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import {
  getAdminReport,
  getExecutiveReport,
  getInstructorReport,
} from "@/services/certificates/reporting-service";
import {
  exportAdminReportCsv,
  exportExecutiveReportCsv,
  exportInstructorReportCsv,
} from "@/services/certificates/export-service";
import { certificateErrorResponse } from "@/app/api/certificates/_utils";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") ?? "auto";
    const format = searchParams.get("format") ?? "json";

    let resolved = scope;
    if (scope === "auto") {
      if (user.role === ROLES.SUPER_ADMIN) resolved = "executive";
      else if (user.role === ROLES.ADMIN) resolved = "admin";
      else resolved = "instructor";
    }

    if (resolved === "executive") {
      if (user.role !== ROLES.SUPER_ADMIN) {
        return NextResponse.json(
          { success: false, data: null, error: "Executive reports require Super Admin" },
          { status: 403 },
        );
      }
      await requirePermission(PERMISSIONS.REPORTS_VIEW);
      // Super admin also has reports.view via ALL; allow CERTIFICATES_MANAGE path
      if (format === "csv") {
        const csv = await exportExecutiveReportCsv(user);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="executive-report.csv"',
          },
        });
      }
      return NextResponse.json({
        success: true,
        data: getExecutiveReport(),
        error: null,
      });
    }

    if (resolved === "admin") {
      if (user.role !== ROLES.ADMIN && user.role !== ROLES.SUPER_ADMIN) {
        return NextResponse.json(
          { success: false, data: null, error: "Admin reports require Admin or Super Admin" },
          { status: 403 },
        );
      }
      await requirePermission(PERMISSIONS.REPORTS_VIEW);
      if (format === "csv") {
        const csv = await exportAdminReportCsv(user);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="admin-report.csv"',
          },
        });
      }
      return NextResponse.json({
        success: true,
        data: getAdminReport(),
        error: null,
      });
    }

    await requirePermission(PERMISSIONS.REPORTS_OWN);
    let instructorId = searchParams.get("instructorId") || user.id;
    if (instructorId !== user.id && user.role !== ROLES.ADMIN && user.role !== ROLES.SUPER_ADMIN) {
      instructorId = user.id;
    }
    if (format === "csv") {
      const csv = await exportInstructorReportCsv(user, instructorId);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="instructor-report.csv"',
        },
      });
    }
    return NextResponse.json({
      success: true,
      data: getInstructorReport(instructorId),
      error: null,
    });
  } catch (error) {
    return certificateErrorResponse(error);
  }
}
