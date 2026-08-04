/**
 * Lesson + resource service.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { RESOURCE_TYPES } from "@/constants/courses";
import { logActivity } from "@/services/auth/activity-log";
import { getCourseById, recountCourseDuration } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import {
  CourseValidationError,
  assertNonEmptyTitle,
} from "@/services/courses/validation";
import type {
  ContentStatus,
  Lesson,
  LessonResource,
  ResourceType,
} from "@/types/courses";

export function listLessons(moduleId: string): Lesson[] {
  ensureCoursesSeeded();
  return readCoursesDb()
    .lessons.filter((l) => l.moduleId === moduleId)
    .sort((a, b) => a.order - b.order);
}

export function getLesson(id: string): (Lesson & { resources: LessonResource[] }) | null {
  ensureCoursesSeeded();
  const lesson = readCoursesDb().lessons.find((l) => l.id === id);
  if (!lesson) return null;
  const resources = readCoursesDb()
    .resources.filter((r) => r.lessonId === id)
    .sort((a, b) => a.order - b.order);
  return { ...lesson, resources };
}

export async function createLesson(input: {
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  contentHtml?: string;
  videoUrl?: string | null;
  durationMinutes?: number;
  estimatedStudyMinutes?: number;
  order?: number;
  previewAvailable?: boolean;
  status?: ContentStatus;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<Lesson> {
  ensureCoursesSeeded();
  if (!getCourseById(input.courseId)) throw new CourseValidationError("Course not found");
  const mod = readCoursesDb().modules.find(
    (m) => m.id === input.moduleId && m.courseId === input.courseId,
  );
  if (!mod) throw new CourseValidationError("Module not found");

  const title = assertNonEmptyTitle("Lesson", input.title);
  const existing = listLessons(input.moduleId);
  const now = new Date().toISOString();
  const lesson: Lesson = {
    id: generateId(),
    courseId: input.courseId,
    moduleId: input.moduleId,
    title,
    description: input.description?.trim() ?? "",
    contentHtml: input.contentHtml ?? "",
    videoUrl: input.videoUrl ?? null,
    durationMinutes: Math.max(0, Number(input.durationMinutes) || 0),
    estimatedStudyMinutes: Math.max(0, Number(input.estimatedStudyMinutes) || 0),
    order: input.order ?? existing.length + 1,
    previewAvailable: Boolean(input.previewAvailable),
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };

  writeCoursesDb((d) => {
    d.lessons.push(lesson);
  });
  recountCourseDuration(input.courseId);

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.LESSON_CREATED,
    entityType: "lesson",
    entityId: lesson.id,
    metadata: { courseId: input.courseId, moduleId: input.moduleId, title },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return lesson;
}

export async function updateLesson(input: {
  id: string;
  patch: Partial<
    Pick<
      Lesson,
      | "title"
      | "description"
      | "contentHtml"
      | "videoUrl"
      | "durationMinutes"
      | "estimatedStudyMinutes"
      | "order"
      | "previewAvailable"
      | "status"
    >
  >;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<Lesson> {
  ensureCoursesSeeded();
  const existing = readCoursesDb().lessons.find((l) => l.id === input.id);
  if (!existing) throw new CourseValidationError("Lesson not found");

  const next: Lesson = {
    ...existing,
    ...input.patch,
    title:
      input.patch.title !== undefined
        ? assertNonEmptyTitle("Lesson", input.patch.title)
        : existing.title,
    updatedAt: new Date().toISOString(),
  };

  writeCoursesDb((d) => {
    const idx = d.lessons.findIndex((l) => l.id === input.id);
    if (idx >= 0) d.lessons[idx] = next;
  });
  recountCourseDuration(existing.courseId);

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.LESSON_UPDATED,
    entityType: "lesson",
    entityId: input.id,
    metadata: { courseId: existing.courseId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return next;
}

export async function deleteLesson(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  ensureCoursesSeeded();
  const existing = readCoursesDb().lessons.find((l) => l.id === input.id);
  if (!existing) throw new CourseValidationError("Lesson not found");

  writeCoursesDb((d) => {
    d.lessons = d.lessons.filter((l) => l.id !== input.id);
    d.resources = d.resources.filter((r) => r.lessonId !== input.id);
  });
  recountCourseDuration(existing.courseId);

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.LESSON_DELETED,
    entityType: "lesson",
    entityId: input.id,
    metadata: { courseId: existing.courseId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export async function addResource(input: {
  lessonId: string;
  title: string;
  type: ResourceType;
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  downloadable?: boolean;
  order?: number;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<LessonResource> {
  ensureCoursesSeeded();
  const lesson = readCoursesDb().lessons.find((l) => l.id === input.lessonId);
  if (!lesson) throw new CourseValidationError("Lesson not found");
  if (!RESOURCE_TYPES.includes(input.type)) {
    throw new CourseValidationError("Invalid resource type");
  }
  if (!input.url?.trim()) throw new CourseValidationError("Resource URL is required");
  const title = assertNonEmptyTitle("Resource", input.title);
  const existing = readCoursesDb().resources.filter((r) => r.lessonId === input.lessonId);
  const now = new Date().toISOString();
  const resource: LessonResource = {
    id: generateId(),
    lessonId: input.lessonId,
    title,
    type: input.type,
    url: input.url.trim(),
    fileName: input.fileName ?? null,
    mimeType: input.mimeType ?? null,
    sizeBytes: input.sizeBytes ?? null,
    downloadable: input.downloadable ?? true,
    order: input.order ?? existing.length + 1,
    createdAt: now,
    updatedAt: now,
  };

  writeCoursesDb((d) => {
    d.resources.push(resource);
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.RESOURCE_ADDED,
    entityType: "lesson_resource",
    entityId: resource.id,
    metadata: { lessonId: input.lessonId, type: input.type },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return resource;
}

export async function removeResource(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  ensureCoursesSeeded();
  const existing = readCoursesDb().resources.find((r) => r.id === input.id);
  if (!existing) throw new CourseValidationError("Resource not found");

  writeCoursesDb((d) => {
    d.resources = d.resources.filter((r) => r.id !== input.id);
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.RESOURCE_REMOVED,
    entityType: "lesson_resource",
    entityId: input.id,
    metadata: { lessonId: existing.lessonId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
