import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { logActivity } from "@/services/auth/activity-log";
import { getPlatformSettings } from "@/services/settings/settings-service";
import {
  createCommercialLicense,
  listCommercialLicenses,
  updateLicenseMeta,
  uploadLicenseVersion,
  getCommercialLicense,
} from "@/services/licenses/license-service";
import { UploadSecurityError } from "@/lib/security/upload";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { writeOpsLog } from "@/services/ops/logging-service";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const row = getCommercialLicense(id);
      if (!row) {
        return NextResponse.json(
          { success: false, data: null, error: "License not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: row, error: null });
    }
    return NextResponse.json({
      success: true,
      data: listCommercialLicenses(),
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

    const user = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const licenseId = String(form.get("licenseId") ?? "");
      const file = form.get("file");
      if (!licenseId || !(file instanceof File)) {
        return NextResponse.json(
          { success: false, data: null, error: "licenseId and PDF file required" },
          { status: 400 },
        );
      }
      const settings = getPlatformSettings();
      const maxBytes = Math.max(settings.security.maxUploadSizeMb, 20) * 1024 * 1024;
      const result = await uploadLicenseVersion({
        licenseId,
        file,
        versionLabel: form.get("versionLabel") ? String(form.get("versionLabel")) : undefined,
        notes: form.get("notes") ? String(form.get("notes")) : undefined,
        actorId: user.id,
        maxBytes,
      });
      await logActivity({
        actorId: user.id,
        action: ACTIVITY_ACTIONS.LICENSE_UPLOAD,
        entityType: "commercial_license",
        entityId: licenseId,
        metadata: { versionId: result.version.id, url: result.version.url },
      });
      writeOpsLog({
        level: "info",
        category: "security",
        message: "Commercial license version uploaded",
        userId: user.id,
        path: result.version.url,
      });
      return NextResponse.json({ success: true, data: result, error: null });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }

    if (body.action === "update_meta" && body.licenseId) {
      const updated = updateLicenseMeta({
        licenseId: String(body.licenseId),
        title: body.title != null ? String(body.title) : undefined,
        issuer: body.issuer != null ? String(body.issuer) : undefined,
        documentNumber: body.documentNumber != null ? String(body.documentNumber) : undefined,
        issuedAt: (body.issuedAt as string | null | undefined) ?? undefined,
        expiresAt: (body.expiresAt as string | null | undefined) ?? undefined,
      });
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    const created = await createCommercialLicense({
      title: String(body.title ?? "Commercial License"),
      issuer: body.issuer != null ? String(body.issuer) : undefined,
      documentNumber: body.documentNumber != null ? String(body.documentNumber) : undefined,
      issuedAt: (body.issuedAt as string | null | undefined) ?? null,
      expiresAt: (body.expiresAt as string | null | undefined) ?? null,
      actorId: user.id,
    });
    await logActivity({
      actorId: user.id,
      action: ACTIVITY_ACTIONS.LICENSE_CREATED,
      entityType: "commercial_license",
      entityId: created.id,
    });
    return NextResponse.json({ success: true, data: created, error: null });
  } catch (error) {
    if (error instanceof UploadSecurityError) {
      return NextResponse.json(
        { success: false, data: null, error: error.message },
        { status: error.status },
      );
    }
    return authErrorResponse(error);
  }
}
