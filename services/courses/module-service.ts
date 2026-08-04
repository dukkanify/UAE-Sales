/**
 * Module service — course → modules hierarchy.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { getCourseById, recountCourseDuration } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import {
  CourseValidationError,
  assertNonEmptyTitle,
} from "@/services/courses/validation";
import type { ContentStatus, CourseModule } from "@/types/courses";

export function listModules(courseId: string): CourseModule[] {
  ensureCoursesSeeded();
  return readCoursesDb()
    .modules.filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export async function createModule(input: {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  estimatedDurationMinutes?: number;
  status?: ContentStatus;
  visible?: boolean;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CourseModule> {
  ensureCoursesSeeded();
  if (!getCourseById(input.courseId)) throw new CourseValidationError("Course not found");
  const title = assertNonEmptyTitle("Module", input.title);
  const existing = listModules(input.courseId);
  const now = new Date().toISOString();
  const mod: CourseModule = {
    id: generateId(),
    courseId: input.courseId,
    title,
    description: input.description?.trim() ?? "",
    order: input.order ?? existing.length + 1,
    estimatedDurationMinutes: Math.max(0, Number(input.estimatedDurationMinutes) || 0),
    status: input.status ?? "draft",
    visible: input.visible ?? true,
    createdAt: now,
    updatedAt: now,
  };

  writeCoursesDb((d) => {
    d.modules.push(mod);
  });
  recountCourseDuration(input.courseId);

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.MODULE_CREATED,
    entityType: "course_module",
    entityId: mod.id,
    metadata: { courseId: input.courseId, title },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return mod;
}

export async function updateModule(input: {
  id: string;
  patch: Partial<
    Pick<
      CourseModule,
      "title" | "description" | "order" | "estimatedDurationMinutes" | "status" | "visible"
    >
  >;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CourseModule> {
  ensureCoursesSeeded();
  const db = readCoursesDb();
  const existing = db.modules.find((m) => m.id === input.id);
  if (!existing) throw new CourseValidationError("Module not found");

  const next: CourseModule = {
    ...existing,
    ...input.patch,
    title:
      input.patch.title !== undefined
        ? assertNonEmptyTitle("Module", input.patch.title)
        : existing.title,
    description:
      input.patch.description !== undefined
        ? input.patch.description.trim()
        : existing.description,
    updatedAt: new Date().toISOString(),
  };

  writeCoursesDb((d) => {
    const idx = d.modules.findIndex((m) => m.id === input.id);
    if (idx >= 0) d.modules[idx] = next;
  });
  recountCourseDuration(existing.courseId);

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.MODULE_UPDATED,
    entityType: "course_module",
    entityId: input.id,
    metadata: { courseId: existing.courseId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return next;
}

export async function deleteModule(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  ensureCoursesSeeded();
  const db = readCoursesDb();
  const existing = db.modules.find((m) => m.id === input.id);
  if (!existing) throw new CourseValidationError("Module not found");

  const lessonIds = db.lessons.filter((l) => l.moduleId === input.id).map((l) => l.id);

  writeCoursesDb((d) => {
    d.modules = d.modules.filter((m) => m.id !== input.id);
    d.lessons = d.lessons.filter((l) => l.moduleId !== input.id);
    d.resources = d.resources.filter((r) => !lessonIds.includes(r.lessonId));
  });
  recountCourseDuration(existing.courseId);

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.MODULE_DELETED,
    entityType: "course_module",
    entityId: input.id,
    metadata: { courseId: existing.courseId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export async function reorderModules(input: {
  courseId: string;
  orderedIds: string[];
  actorId: string | null;
}): Promise<CourseModule[]> {
  ensureCoursesSeeded();
  if (!getCourseById(input.courseId)) throw new CourseValidationError("Course not found");
  const now = new Date().toISOString();
  writeCoursesDb((d) => {
    input.orderedIds.forEach((id, index) => {
      const idx = d.modules.findIndex((m) => m.id === id && m.courseId === input.courseId);
      const current = idx >= 0 ? d.modules[idx] : undefined;
      if (current) {
        d.modules[idx] = { ...current, order: index + 1, updatedAt: now };
      }
    });
  });
  return listModules(input.courseId);
}
