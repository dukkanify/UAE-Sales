import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { logActivity } from "@/services/auth/activity-log";
import { getPlatformSettings } from "@/services/settings/settings-service";
import {
  addMediaCategory,
  deleteMediaAsset,
  listMediaAssets,
  listMediaCategories,
  updateMediaAsset,
  uploadMediaAsset,
} from "@/services/media-library/media-library-service";
import { UploadSecurityError } from "@/lib/security/upload";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import type { MediaAssetKind } from "@/types/media-library";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "assets";
    if (view === "categories") {
      return NextResponse.json({
        success: true,
        data: listMediaCategories(),
        error: null,
      });
    }
    return NextResponse.json({
      success: true,
      data: {
        categories: listMediaCategories(),
        assets: listMediaAssets({
          categoryId: searchParams.get("categoryId") ?? undefined,
          kind: searchParams.get("kind") ?? undefined,
          q: searchParams.get("q") ?? undefined,
        }),
      },
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
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, data: null, error: "file is required" },
          { status: 400 },
        );
      }
      const settings = getPlatformSettings();
      const asset = await uploadMediaAsset({
        file,
        title: form.get("title") ? String(form.get("title")) : undefined,
        description: form.get("description") ? String(form.get("description")) : undefined,
        categoryId: String(form.get("categoryId") ?? "background_images"),
        kind: (form.get("kind") ? String(form.get("kind")) : "media") as MediaAssetKind,
        altText: form.get("altText") ? String(form.get("altText")) : undefined,
        seoTitle: form.get("seoTitle") ? String(form.get("seoTitle")) : undefined,
        seoDescription: form.get("seoDescription") ? String(form.get("seoDescription")) : undefined,
        tags: form.get("tags")
          ? String(form.get("tags"))
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        actorId: user.id,
        maxBytes: settings.security.maxUploadSizeMb * 1024 * 1024,
        allowedMimeTypes: settings.security.allowedFileTypes,
      });
      await logActivity({
        actorId: user.id,
        action: ACTIVITY_ACTIONS.MEDIA_LIBRARY_UPLOAD,
        entityType: "media_library",
        entityId: asset.id,
        metadata: { url: asset.url, categoryId: asset.categoryId },
      });
      return NextResponse.json({ success: true, data: asset, error: null });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body?.action) {
      return NextResponse.json(
        { success: false, data: null, error: "action required" },
        { status: 400 },
      );
    }

    if (body.action === "add_category") {
      const cat = addMediaCategory({
        id: String(body.id ?? ""),
        label: String(body.label ?? ""),
        description: body.description != null ? String(body.description) : undefined,
      });
      return NextResponse.json({ success: true, data: cat, error: null });
    }

    if (body.action === "update_asset" && body.id) {
      const updated = updateMediaAsset(String(body.id), {
        title: body.title != null ? String(body.title) : undefined,
        description: body.description != null ? String(body.description) : undefined,
        categoryId: body.categoryId != null ? String(body.categoryId) : undefined,
        kind: body.kind != null ? (String(body.kind) as MediaAssetKind) : undefined,
        altText: body.altText != null ? String(body.altText) : undefined,
        seoTitle: body.seoTitle != null ? String(body.seoTitle) : undefined,
        seoDescription: body.seoDescription != null ? String(body.seoDescription) : undefined,
        tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      });
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    if (body.action === "delete_asset" && body.id) {
      const ok = deleteMediaAsset(String(body.id));
      if (!ok) {
        return NextResponse.json(
          { success: false, data: null, error: "Asset not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: { id: body.id }, error: null });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unknown action" },
      { status: 400 },
    );
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
