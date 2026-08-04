import { NextResponse } from "next/server";

import { requirePermission, authErrorResponse } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import {
  createBackup,
  listBackups,
  restoreBackup,
  testRestore,
} from "@/services/ops/backup-service";
import { getHealthSnapshot, getProductionChecklist } from "@/services/ops/health-service";
import { exportOpsLogsCsv, listOpsLogs } from "@/services/ops/logging-service";
import type { BackupRetention, OpsLogCategory, OpsLogLevel } from "@/services/ops";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "health";

    if (view === "logs") {
      const format = searchParams.get("format");
      if (format === "csv") {
        const csv = exportOpsLogsCsv(500);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="ops-logs.csv"',
          },
        });
      }
      return NextResponse.json({
        success: true,
        data: listOpsLogs({
          category: (searchParams.get("category") as OpsLogCategory | "all") || "all",
          level: (searchParams.get("level") as OpsLogLevel | "all") || "all",
          q: searchParams.get("q") ?? undefined,
          limit: Number(searchParams.get("limit") ?? 200),
        }),
        error: null,
      });
    }

    if (view === "backups") {
      return NextResponse.json({
        success: true,
        data: listBackups(),
        error: null,
      });
    }

    if (view === "checklist") {
      return NextResponse.json({
        success: true,
        data: getProductionChecklist(),
        error: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: getHealthSnapshot({ deep: true }),
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const body = (await request.json()) as {
      action?: string;
      retention?: BackupRetention;
      backupId?: string;
      includeUploads?: boolean;
      notes?: string;
    };

    if (body.action === "backup") {
      const manifest = createBackup({
        retention: body.retention ?? "daily",
        notes: body.notes,
      });
      return NextResponse.json({ success: true, data: manifest, error: null });
    }
    if (body.action === "test_restore" && body.backupId) {
      return NextResponse.json({
        success: true,
        data: testRestore(body.backupId),
        error: null,
      });
    }
    if (body.action === "restore" && body.backupId) {
      return NextResponse.json({
        success: true,
        data: restoreBackup(body.backupId, {
          includeUploads: body.includeUploads,
        }),
        error: null,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
