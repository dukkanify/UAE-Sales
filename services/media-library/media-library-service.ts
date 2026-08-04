/**
 * Aviation media library service — categorized assets with SEO metadata.
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";
import { validateUpload, virusScanHook, UploadSecurityError } from "@/lib/security/upload";
import { readMediaLibraryDb, writeMediaLibraryDb } from "@/services/media-library/store";
import type {
  MediaAssetKind,
  MediaLibraryAsset,
  MediaLibraryCategory,
  MediaLibraryCategoryId,
} from "@/types/media-library";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media-library");

export function listMediaCategories(): MediaLibraryCategory[] {
  return readMediaLibraryDb().categories;
}

export function listMediaAssets(filters?: {
  categoryId?: string;
  kind?: string;
  q?: string;
}): MediaLibraryAsset[] {
  let rows = readMediaLibraryDb().assets;
  if (filters?.categoryId && filters.categoryId !== "all") {
    rows = rows.filter((a) => a.categoryId === filters.categoryId);
  }
  if (filters?.kind && filters.kind !== "all") {
    rows = rows.filter((a) => a.kind === filters.kind);
  }
  if (filters?.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    rows = rows.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.altText.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addMediaCategory(input: {
  id: string;
  label: string;
  description?: string;
}): MediaLibraryCategory {
  const id = input.id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!id) throw new UploadSecurityError("Category id required");
  let created!: MediaLibraryCategory;
  writeMediaLibraryDb((db) => {
    if (db.categories.some((c) => c.id === id)) {
      throw new UploadSecurityError("Category already exists", 409);
    }
    const maxSort = db.categories.reduce((m, c) => Math.max(m, c.sortOrder), 0);
    created = {
      id,
      label: input.label.trim() || id,
      description: input.description?.trim() ?? "",
      sortOrder: maxSort + 10,
    };
    db.categories.push(created);
  });
  return created;
}

export async function uploadMediaAsset(input: {
  file: File;
  title?: string;
  description?: string;
  categoryId: MediaLibraryCategoryId;
  kind?: MediaAssetKind;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  actorId: string | null;
  maxBytes: number;
  allowedMimeTypes: string[];
}): Promise<MediaLibraryAsset> {
  const categories = listMediaCategories();
  if (!categories.some((c) => c.id === input.categoryId)) {
    throw new UploadSecurityError("Unknown media category", 400);
  }

  let safeName: string;
  let mimeType: string;
  try {
    const validated = validateUpload({
      fileName: input.file.name,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      maxBytes: input.maxBytes,
      allowedMimeTypes: input.allowedMimeTypes.filter((t) => t !== "image/svg+xml"),
      allowSvg: false,
    });
    safeName = validated.safeName;
    mimeType = validated.mimeType;
  } catch (error) {
    if (error instanceof UploadSecurityError) throw error;
    throw error;
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const scan = await virusScanHook(buffer);
  if (!scan.clean) throw new UploadSecurityError("File failed security scan");

  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${generateId().slice(0, 12)}-${safeName}`;
  writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  const publicUrl = `/uploads/media-library/${filename}`;

  const now = new Date().toISOString();
  const title = input.title?.trim() || input.file.name.replace(/\.[^.]+$/, "");
  const asset: MediaLibraryAsset = {
    id: generateId(),
    title,
    description: input.description?.trim() ?? "",
    categoryId: input.categoryId,
    kind: input.kind ?? "media",
    fileName: input.file.name,
    mimeType,
    sizeBytes: input.file.size,
    url: publicUrl,
    altText: input.altText?.trim() || title,
    seoTitle: input.seoTitle?.trim() || title,
    seoDescription: input.seoDescription?.trim() ?? "",
    width: null,
    height: null,
    tags: input.tags ?? [],
    uploadedBy: input.actorId,
    createdAt: now,
    updatedAt: now,
  };

  writeMediaLibraryDb((db) => {
    db.assets.unshift(asset);
  });
  return asset;
}

export function updateMediaAsset(
  id: string,
  patch: Partial<
    Pick<
      MediaLibraryAsset,
      | "title"
      | "description"
      | "categoryId"
      | "kind"
      | "altText"
      | "seoTitle"
      | "seoDescription"
      | "tags"
    >
  >,
): MediaLibraryAsset {
  let updated!: MediaLibraryAsset;
  writeMediaLibraryDb((db) => {
    const row = db.assets.find((a) => a.id === id);
    if (!row) throw new UploadSecurityError("Asset not found", 404);
    Object.assign(row, patch);
    row.updatedAt = new Date().toISOString();
    updated = structuredClone(row);
  });
  return updated;
}

export function deleteMediaAsset(id: string): boolean {
  let found = false;
  writeMediaLibraryDb((db) => {
    const before = db.assets.length;
    db.assets = db.assets.filter((a) => a.id !== id);
    found = db.assets.length < before;
  });
  return found;
}
