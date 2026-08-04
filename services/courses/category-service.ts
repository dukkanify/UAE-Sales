/**
 * Category service — main + subcategories with ordering and visibility.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity, logAudit } from "@/services/auth/activity-log";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import { CourseValidationError, assertNonEmptyTitle } from "@/services/courses/validation";
import type { CourseCategory } from "@/types/courses";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function listCategories(options?: { includeHidden?: boolean }): CourseCategory[] {
  ensureCoursesSeeded();
  const rows = readCoursesDb().categories;
  const filtered = options?.includeHidden ? rows : rows.filter((c) => c.visible);
  return [...filtered].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function getCategoryTree(options?: { includeHidden?: boolean }) {
  const all = listCategories(options);
  const roots = all.filter((c) => !c.parentId);
  return roots.map((root) => ({
    ...root,
    children: all.filter((c) => c.parentId === root.id),
  }));
}

export function getCategoryById(id: string): CourseCategory | null {
  ensureCoursesSeeded();
  return readCoursesDb().categories.find((c) => c.id === id) ?? null;
}

export async function createCategory(input: {
  name: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  order?: number;
  visible?: boolean;
  metadata?: Record<string, unknown>;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CourseCategory> {
  ensureCoursesSeeded();
  const name = assertNonEmptyTitle("Category", input.name);
  const slug = slugify(name);
  const db = readCoursesDb();
  if (db.categories.some((c) => c.slug === slug)) {
    throw new CourseValidationError("A category with this name already exists");
  }
  if (input.parentId && !db.categories.some((c) => c.id === input.parentId)) {
    throw new CourseValidationError("Parent category not found");
  }

  const now = new Date().toISOString();
  const category: CourseCategory = {
    id: generateId(),
    name,
    slug,
    description: input.description?.trim() ?? "",
    parentId: input.parentId ?? null,
    icon: input.icon?.trim() || "Folder",
    order: input.order ?? db.categories.length + 1,
    visible: input.visible ?? true,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };

  writeCoursesDb((d) => {
    d.categories.push(category);
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CATEGORY_CREATED,
    entityType: "course_category",
    entityId: category.id,
    metadata: { name: category.name },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return category;
}

export async function updateCategory(input: {
  id: string;
  patch: Partial<
    Pick<CourseCategory, "name" | "description" | "parentId" | "icon" | "order" | "visible" | "metadata">
  >;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CourseCategory> {
  ensureCoursesSeeded();
  const existing = getCategoryById(input.id);
  if (!existing) throw new CourseValidationError("Category not found");

  const next: CourseCategory = {
    ...existing,
    ...input.patch,
    name: input.patch.name !== undefined ? assertNonEmptyTitle("Category", input.patch.name) : existing.name,
    slug:
      input.patch.name !== undefined
        ? slugify(assertNonEmptyTitle("Category", input.patch.name))
        : existing.slug,
    updatedAt: new Date().toISOString(),
  };

  if (next.parentId === next.id) {
    throw new CourseValidationError("Category cannot be its own parent");
  }

  writeCoursesDb((d) => {
    const idx = d.categories.findIndex((c) => c.id === input.id);
    if (idx >= 0) d.categories[idx] = next;
  });

  await logAudit({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CATEGORY_UPDATED,
    resource: `course_category:${input.id}`,
    beforeState: existing as unknown as Record<string, unknown>,
    afterState: next as unknown as Record<string, unknown>,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return next;
}

export async function deleteCategory(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  ensureCoursesSeeded();
  const db = readCoursesDb();
  const existing = db.categories.find((c) => c.id === input.id);
  if (!existing) throw new CourseValidationError("Category not found");
  if (db.categories.some((c) => c.parentId === input.id)) {
    throw new CourseValidationError("Remove or reassign subcategories first");
  }
  if (db.courses.some((c) => !c.deletedAt && c.categoryId === input.id)) {
    throw new CourseValidationError("Cannot delete a category that has courses");
  }

  writeCoursesDb((d) => {
    d.categories = d.categories.filter((c) => c.id !== input.id);
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CATEGORY_DELETED,
    entityType: "course_category",
    entityId: input.id,
    metadata: { name: existing.name },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
