import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { updatePlatformSettings } from "@/services/settings/settings-service";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { logActivity } from "@/services/auth/activity-log";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { generateId } from "@/lib/security/crypto";

const BRAND_KEYS = [
  "logoUrl",
  "darkLogoUrl",
  "faviconUrl",
  "loginBackgroundUrl",
  "loginIllustrationUrl",
  "openGraphImageUrl",
] as const;

type BrandKey = (typeof BRAND_KEYS)[number];

/**
 * Local branding upload with Supabase Storage readiness.
 * When storage.provider === "supabase", callers should use the storage service;
 * local mode writes under public/uploads/branding for immediate use.
 */
export async function POST(request: Request) {
  try {
    const user = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const form = await request.formData();
    const file = form.get("file");
    const key = String(form.get("key") ?? "") as BrandKey;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, data: null, error: "file is required" },
        { status: 400 },
      );
    }
    if (!BRAND_KEYS.includes(key)) {
      return NextResponse.json(
        { success: false, data: null, error: "Invalid branding key" },
        { status: 400 },
      );
    }

    const settings = getPlatformSettings();
    const maxBytes = settings.security.maxUploadSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `File exceeds ${settings.security.maxUploadSizeMb}MB limit`,
        },
        { status: 400 },
      );
    }

    if (
      settings.security.allowedFileTypes.length &&
      !settings.security.allowedFileTypes.includes(file.type) &&
      file.type !== ""
    ) {
      return NextResponse.json(
        { success: false, data: null, error: `File type ${file.type} is not allowed` },
        { status: 400 },
      );
    }

    if (settings.storage.provider === "supabase") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "Supabase Storage is selected. Configure Supabase credentials, then retry uploads via the storage provider.",
        },
        { status: 503 },
      );
    }

    const ext = path.extname(file.name) || ".bin";
    const allowed = settings.storage.allowedExtensions;
    if (allowed.length && !allowed.includes(ext.toLowerCase())) {
      return NextResponse.json(
        { success: false, data: null, error: `Extension ${ext} is not allowed` },
        { status: 400 },
      );
    }

    const dir = path.join(process.cwd(), "public", "uploads", "branding");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filename = `${key}-${generateId().slice(0, 12)}${ext.toLowerCase()}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(path.join(dir, filename), buffer);
    const publicUrl = `/uploads/branding/${filename}`;

    const next = await updatePlatformSettings({
      patch: { branding: { [key]: publicUrl } },
      actorId: user.id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    await logActivity({
      actorId: user.id,
      action: ACTIVITY_ACTIONS.BRANDING_UPLOAD,
      entityType: "branding",
      entityId: key,
      metadata: { url: publicUrl, size: file.size, type: file.type },
    });

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, key, settings: next.branding },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
