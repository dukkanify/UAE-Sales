/**
 * Course service — CRUD, publish/archive, duplicate, bulk, search/filters.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { DEFAULT_COURSE_PAGE_SIZE } from "@/constants/courses";
import { logActivity, logAudit } from "@/services/auth/activity-log";
import { readAuthDb } from "@/services/auth/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import {
  CourseValidationError,
  assertCourseCode,
  assertCourseTitle,
  assertDifficulty,
  assertEnrollmentMode,
  assertScheduledPublish,
  assertStatus,
} from "@/services/courses/validation";
import type {
  BulkCourseAction,
  Course,
  CourseDetail,
  CourseFilters,
  CourseInstructorAssignment,
  CourseListItem,
  CourseStats,
} from "@/types/courses";

function userDisplayName(userId: string | null): string | null {
  if (!userId) return null;
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) return null;
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return name || u.email;
}

function toListItem(course: Course): CourseListItem {
  const db = readCoursesDb();
  const category = course.categoryId ? db.categories.find((c) => c.id === course.categoryId) : null;
  const modules = db.modules.filter((m) => m.courseId === course.id);
  const lessons = db.lessons.filter((l) => l.courseId === course.id);
  const resources = db.resources.filter((r) => lessons.some((l) => l.id === r.lessonId));
  const enrollments = db.enrollments.filter((e) => e.courseId === course.id);
  return {
    ...course,
    categoryName: category?.name ?? null,
    primaryInstructorName: userDisplayName(course.primaryInstructorId),
    counts: {
      modules: modules.length,
      lessons: lessons.length,
      resources: resources.length,
      enrollments: enrollments.length,
      activeEnrollments: enrollments.filter((e) => e.status === "approved").length,
    },
  };
}

export function getCourseById(id: string, includeDeleted = false): Course | null {
  ensureCoursesSeeded();
  const course = readCoursesDb().courses.find((c) => c.id === id);
  if (!course) return null;
  if (course.deletedAt && !includeDeleted) return null;
  return course;
}

/** True when the user is primary instructor or assigned on the course. */
export function instructorOwnsCourse(userId: string, courseId: string): boolean {
  const course = getCourseById(courseId);
  if (!course) return false;
  if (course.primaryInstructorId === userId) return true;
  return readCoursesDb().instructors.some((i) => i.courseId === courseId && i.userId === userId);
}

export type InstructorCourseGroup = {
  instructorId: string | null;
  instructorName: string;
  courses: CourseListItem[];
};

/** Demo/integration fixtures that should not appear on marketing surfaces. */
export function isPublicCatalogFixture(course: Pick<Course, "code" | "title">): boolean {
  const code = (course.code || "").toUpperCase();
  if (code.startsWith("INS-TEST-") || code.startsWith("HOME-")) return true;
  return /instructor owned/i.test(course.title || "");
}

/** Published catalog grouped by primary instructor for marketing home. */
export function listPublishedCoursesGroupedByInstructor(pageSize = 100): InstructorCourseGroup[] {
  const { data } = listCourses({
    status: "published",
    pageSize: Math.max(pageSize, 200),
    sortBy: "title",
    sortDir: "asc",
  });

  const groups = new Map<string, InstructorCourseGroup>();
  for (const course of data) {
    if (isPublicCatalogFixture(course)) continue;
    const key = course.primaryInstructorId ?? "__unassigned__";
    const current = groups.get(key);
    if (current) {
      current.courses.push(course);
      continue;
    }
    groups.set(key, {
      instructorId: course.primaryInstructorId,
      instructorName: course.primaryInstructorName?.trim() || "AviatorPass faculty",
      courses: [course],
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.instructorName.localeCompare(b.instructorName),
  );
}

export function getCourseDetail(id: string): CourseDetail | null {
  const course = getCourseById(id);
  if (!course) return null;
  const db = readCoursesDb();
  const modules = db.modules
    .filter((m) => m.courseId === id)
    .sort((a, b) => a.order - b.order)
    .map((mod) => ({
      ...mod,
      lessons: db.lessons
        .filter((l) => l.moduleId === mod.id)
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          ...lesson,
          resources: db.resources
            .filter((r) => r.lessonId === lesson.id)
            .sort((a, b) => a.order - b.order),
        })),
    }));

  return {
    ...toListItem(course),
    modules,
    instructors: db.instructors.filter((i) => i.courseId === id),
  };
}

export function listCourses(filters: CourseFilters = {}): {
  data: CourseListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  ensureCoursesSeeded();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_COURSE_PAGE_SIZE;
  let rows = readCoursesDb().courses.filter((c) => (filters.includeDeleted ? true : !c.deletedAt));

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q),
    );
  }
  if (filters.code) {
    const code = filters.code.toUpperCase();
    rows = rows.filter((c) => c.code.includes(code));
  }
  if (filters.instructorId) {
    const id = filters.instructorId;
    const assigned = new Set(
      readCoursesDb()
        .instructors.filter((i) => i.userId === id)
        .map((i) => i.courseId),
    );
    rows = rows.filter((c) => c.primaryInstructorId === id || assigned.has(c.id));
  }
  if (filters.categoryId && filters.categoryId !== "all") {
    rows = rows.filter((c) => c.categoryId === filters.categoryId);
  }
  if (filters.status && filters.status !== "all") {
    rows = rows.filter((c) => c.status === filters.status);
  }
  if (filters.difficulty && filters.difficulty !== "all") {
    rows = rows.filter((c) => c.difficulty === filters.difficulty);
  }
  if (filters.enrollmentMode && filters.enrollmentMode !== "all") {
    rows = rows.filter((c) => c.enrollmentMode === filters.enrollmentMode);
  }
  if (filters.publishedFrom) {
    const from = Date.parse(filters.publishedFrom);
    rows = rows.filter((c) => c.publishedAt && Date.parse(c.publishedAt) >= from);
  }
  if (filters.publishedTo) {
    const to = Date.parse(filters.publishedTo);
    rows = rows.filter((c) => c.publishedAt && Date.parse(c.publishedAt) <= to);
  }

  const sortBy = filters.sortBy ?? "updatedAt";
  const sortDir = filters.sortDir ?? "desc";
  rows = [...rows].sort((a, b) => {
    const av = String(a[sortBy] ?? "");
    const bv = String(b[sortBy] ?? "");
    const cmp = av.localeCompare(bv);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize).map(toListItem);

  return {
    data: pageRows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getCourseStats(): CourseStats {
  ensureCoursesSeeded();
  const courses = readCoursesDb().courses.filter((c) => !c.deletedAt);
  const enrollments = readCoursesDb().enrollments;
  const activeStudentIds = new Set(
    enrollments.filter((e) => e.status === "approved").map((e) => e.studentId),
  );
  const recentlyUpdated = [...courses]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)
    .map(toListItem);

  return {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "published").length,
    draftCourses: courses.filter((c) => c.status === "draft").length,
    archivedCourses: courses.filter((c) => c.status === "archived").length,
    privateCourses: courses.filter((c) => c.status === "private").length,
    scheduledCourses: courses.filter((c) => c.status === "scheduled").length,
    totalCategories: readCoursesDb().categories.filter((c) => c.visible).length,
    activeStudents: activeStudentIds.size,
    totalEnrollments: enrollments.length,
    recentlyUpdated,
  };
}

function assertUniqueCode(code: string, excludeId?: string) {
  const clash = readCoursesDb().courses.find(
    (c) => !c.deletedAt && c.code === code && c.id !== excludeId,
  );
  if (clash) throw new CourseValidationError(`Course code "${code}" is already in use`);
}

function assertInstructorExists(userId: string | null | undefined) {
  if (!userId) return;
  const user = readAuthDb().users.find((u) => u.id === userId);
  if (!user) throw new CourseValidationError("Instructor not found");
  if (user.role !== "instructor" && user.role !== "admin" && user.role !== "super_admin") {
    throw new CourseValidationError("Assigned user must be an instructor or admin");
  }
}

export type CreateCourseInput = {
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  code: string;
  categoryId?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
  previewVideoUrl?: string | null;
  difficulty?: string;
  language?: string;
  estimatedDurationMinutes?: number;
  enrollmentMode?: string;
  status?: string;
  scheduledPublishAt?: string | null;
  primaryInstructorId?: string | null;
  tags?: string[];
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createCourse(input: CreateCourseInput): Promise<CourseListItem> {
  ensureCoursesSeeded();
  const title = assertCourseTitle(input.title);
  const code = assertCourseCode(input.code);
  assertUniqueCode(code);
  const status = assertStatus(input.status ?? "draft");
  const difficulty = assertDifficulty(input.difficulty ?? "intermediate");
  const enrollmentMode = assertEnrollmentMode(input.enrollmentMode ?? "manual");
  const scheduledPublishAt = assertScheduledPublish(status, input.scheduledPublishAt ?? null);
  assertInstructorExists(input.primaryInstructorId);

  if (input.categoryId) {
    const cat = readCoursesDb().categories.find((c) => c.id === input.categoryId);
    if (!cat) throw new CourseValidationError("Category not found");
  }

  if (status === "published" && !input.primaryInstructorId) {
    throw new CourseValidationError("Published courses require a primary instructor");
  }

  const now = new Date().toISOString();
  const course: Course = {
    id: generateId(),
    title,
    shortDescription: input.shortDescription?.trim() ?? "",
    fullDescription: input.fullDescription?.trim() ?? "",
    code,
    categoryId: input.categoryId ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    coverImageUrl: input.coverImageUrl ?? null,
    previewVideoUrl: input.previewVideoUrl ?? null,
    difficulty,
    language: input.language?.trim() || "en",
    estimatedDurationMinutes: Math.max(0, Number(input.estimatedDurationMinutes) || 0),
    enrollmentMode,
    status,
    scheduledPublishAt,
    primaryInstructorId: input.primaryInstructorId ?? null,
    tags: input.tags ?? [],
    metadata: {},
    createdById: input.actorId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    publishedAt: status === "published" ? now : null,
    archivedAt: status === "archived" ? now : null,
  };

  writeCoursesDb((d) => {
    d.courses.push(course);
    if (course.primaryInstructorId) {
      d.instructors.push({
        id: generateId(),
        courseId: course.id,
        userId: course.primaryInstructorId,
        role: "primary",
        assignedAt: now,
      });
    }
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.COURSE_CREATED,
    entityType: "course",
    entityId: course.id,
    metadata: { code: course.code, title: course.title, status: course.status },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  await logAudit({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.COURSE_CREATED,
    resource: `course:${course.id}`,
    afterState: course as unknown as Record<string, unknown>,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return toListItem(course);
}

export async function updateCourse(input: {
  id: string;
  patch: Partial<CreateCourseInput>;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CourseListItem> {
  ensureCoursesSeeded();
  const existing = getCourseById(input.id);
  if (!existing) throw new CourseValidationError("Course not found");

  const title =
    input.patch.title !== undefined ? assertCourseTitle(input.patch.title) : existing.title;
  const code = input.patch.code !== undefined ? assertCourseCode(input.patch.code) : existing.code;
  assertUniqueCode(code, existing.id);
  const status =
    input.patch.status !== undefined ? assertStatus(input.patch.status) : existing.status;
  const difficulty =
    input.patch.difficulty !== undefined
      ? assertDifficulty(input.patch.difficulty)
      : existing.difficulty;
  const enrollmentMode =
    input.patch.enrollmentMode !== undefined
      ? assertEnrollmentMode(input.patch.enrollmentMode)
      : existing.enrollmentMode;
  const scheduledPublishAt = assertScheduledPublish(
    status,
    input.patch.scheduledPublishAt !== undefined
      ? input.patch.scheduledPublishAt
      : existing.scheduledPublishAt,
  );
  const primaryInstructorId =
    input.patch.primaryInstructorId !== undefined
      ? input.patch.primaryInstructorId
      : existing.primaryInstructorId;
  assertInstructorExists(primaryInstructorId);

  if (status === "published" && !primaryInstructorId) {
    throw new CourseValidationError("Published courses require a primary instructor");
  }

  const now = new Date().toISOString();
  const next: Course = {
    ...existing,
    title,
    code,
    shortDescription:
      input.patch.shortDescription !== undefined
        ? input.patch.shortDescription.trim()
        : existing.shortDescription,
    fullDescription:
      input.patch.fullDescription !== undefined
        ? input.patch.fullDescription.trim()
        : existing.fullDescription,
    categoryId: input.patch.categoryId !== undefined ? input.patch.categoryId : existing.categoryId,
    thumbnailUrl:
      input.patch.thumbnailUrl !== undefined ? input.patch.thumbnailUrl : existing.thumbnailUrl,
    coverImageUrl:
      input.patch.coverImageUrl !== undefined ? input.patch.coverImageUrl : existing.coverImageUrl,
    previewVideoUrl:
      input.patch.previewVideoUrl !== undefined
        ? input.patch.previewVideoUrl
        : existing.previewVideoUrl,
    difficulty,
    language: input.patch.language?.trim() || existing.language,
    estimatedDurationMinutes:
      input.patch.estimatedDurationMinutes !== undefined
        ? Math.max(0, Number(input.patch.estimatedDurationMinutes) || 0)
        : existing.estimatedDurationMinutes,
    enrollmentMode,
    status,
    scheduledPublishAt,
    primaryInstructorId,
    tags: input.patch.tags ?? existing.tags,
    updatedAt: now,
    publishedAt:
      status === "published"
        ? (existing.publishedAt ?? now)
        : status === "draft" || status === "private"
          ? existing.publishedAt
          : existing.publishedAt,
    archivedAt: status === "archived" ? (existing.archivedAt ?? now) : null,
  };

  writeCoursesDb((d) => {
    const idx = d.courses.findIndex((c) => c.id === existing.id);
    if (idx >= 0) d.courses[idx] = next;

    if (primaryInstructorId) {
      const others = d.instructors.filter(
        (i) => !(i.courseId === existing.id && i.role === "primary"),
      );
      const primary: CourseInstructorAssignment = {
        id: generateId(),
        courseId: existing.id,
        userId: primaryInstructorId,
        role: "primary",
        assignedAt: now,
      };
      d.instructors = [...others, primary];
    }
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.COURSE_UPDATED,
    entityType: "course",
    entityId: next.id,
    metadata: { code: next.code, status: next.status },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  await logAudit({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.COURSE_UPDATED,
    resource: `course:${next.id}`,
    beforeState: existing as unknown as Record<string, unknown>,
    afterState: next as unknown as Record<string, unknown>,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return toListItem(next);
}

async function setStatus(
  id: string,
  status: Course["status"],
  actorId: string | null,
  action: string,
  ipAddress?: string | null,
  userAgent?: string | null,
): Promise<CourseListItem> {
  const existing = getCourseById(id);
  if (!existing) throw new CourseValidationError("Course not found");
  if (status === "published" && !existing.primaryInstructorId) {
    throw new CourseValidationError("Published courses require a primary instructor");
  }
  const now = new Date().toISOString();
  const next: Course = {
    ...existing,
    status,
    updatedAt: now,
    publishedAt: status === "published" ? (existing.publishedAt ?? now) : existing.publishedAt,
    archivedAt: status === "archived" ? now : existing.archivedAt,
    scheduledPublishAt: status === "scheduled" ? existing.scheduledPublishAt : null,
  };
  writeCoursesDb((d) => {
    const idx = d.courses.findIndex((c) => c.id === id);
    if (idx >= 0) d.courses[idx] = next;
  });
  await logActivity({
    actorId,
    action,
    entityType: "course",
    entityId: id,
    metadata: { from: existing.status, to: status, code: existing.code },
    ipAddress,
    userAgent,
  });
  return toListItem(next);
}

export async function publishCourse(
  id: string,
  actorId: string | null,
  ctx?: { ipAddress?: string | null; userAgent?: string | null },
) {
  return setStatus(
    id,
    "published",
    actorId,
    ACTIVITY_ACTIONS.COURSE_PUBLISHED,
    ctx?.ipAddress,
    ctx?.userAgent,
  );
}

export async function unpublishCourse(
  id: string,
  actorId: string | null,
  ctx?: { ipAddress?: string | null; userAgent?: string | null },
) {
  return setStatus(
    id,
    "draft",
    actorId,
    ACTIVITY_ACTIONS.COURSE_UNPUBLISHED,
    ctx?.ipAddress,
    ctx?.userAgent,
  );
}

export async function archiveCourse(
  id: string,
  actorId: string | null,
  ctx?: { ipAddress?: string | null; userAgent?: string | null },
) {
  return setStatus(
    id,
    "archived",
    actorId,
    ACTIVITY_ACTIONS.COURSE_ARCHIVED,
    ctx?.ipAddress,
    ctx?.userAgent,
  );
}

export async function softDeleteCourse(
  id: string,
  actorId: string | null,
  ctx?: { ipAddress?: string | null; userAgent?: string | null },
): Promise<void> {
  const existing = getCourseById(id);
  if (!existing) throw new CourseValidationError("Course not found");
  const now = new Date().toISOString();
  writeCoursesDb((d) => {
    const idx = d.courses.findIndex((c) => c.id === id);
    const current = idx >= 0 ? d.courses[idx] : undefined;
    if (current) {
      d.courses[idx] = {
        ...current,
        deletedAt: now,
        status: "archived",
        updatedAt: now,
        archivedAt: now,
      };
    }
  });
  await logActivity({
    actorId,
    action: ACTIVITY_ACTIONS.COURSE_DELETED,
    entityType: "course",
    entityId: id,
    metadata: { code: existing.code },
    ipAddress: ctx?.ipAddress,
    userAgent: ctx?.userAgent,
  });
}

export async function duplicateCourse(
  id: string,
  actorId: string | null,
  ctx?: { ipAddress?: string | null; userAgent?: string | null },
): Promise<CourseDetail> {
  const detail = getCourseDetail(id);
  if (!detail) throw new CourseValidationError("Course not found");

  let code = `${detail.code}-COPY`;
  let n = 2;
  while (readCoursesDb().courses.some((c) => !c.deletedAt && c.code === code)) {
    code = `${detail.code}-COPY${n}`;
    n += 1;
  }

  const now = new Date().toISOString();
  const newCourseId = generateId();
  const course: Course = {
    ...detail,
    id: newCourseId,
    title: `${detail.title} (Copy)`,
    code,
    status: "draft",
    publishedAt: null,
    archivedAt: null,
    scheduledPublishAt: null,
    createdById: actorId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const moduleIdMap = new Map<string, string>();
  const lessonIdMap = new Map<string, string>();

  writeCoursesDb((d) => {
    d.courses.push(course);
    for (const mod of detail.modules) {
      const newModId = generateId();
      moduleIdMap.set(mod.id, newModId);
      d.modules.push({
        ...mod,
        id: newModId,
        courseId: newCourseId,
        createdAt: now,
        updatedAt: now,
      });
      for (const lesson of mod.lessons) {
        const newLessonId = generateId();
        lessonIdMap.set(lesson.id, newLessonId);
        d.lessons.push({
          ...lesson,
          id: newLessonId,
          courseId: newCourseId,
          moduleId: newModId,
          createdAt: now,
          updatedAt: now,
        });
        for (const res of lesson.resources) {
          d.resources.push({
            ...res,
            id: generateId(),
            lessonId: newLessonId,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
    for (const inst of detail.instructors) {
      d.instructors.push({
        ...inst,
        id: generateId(),
        courseId: newCourseId,
        assignedAt: now,
      });
    }
  });

  await logActivity({
    actorId,
    action: ACTIVITY_ACTIONS.COURSE_DUPLICATED,
    entityType: "course",
    entityId: newCourseId,
    metadata: { sourceId: id, code },
    ipAddress: ctx?.ipAddress,
    userAgent: ctx?.userAgent,
  });

  const created = getCourseDetail(newCourseId);
  if (!created) throw new CourseValidationError("Failed to duplicate course");
  return created;
}

export async function assignInstructor(input: {
  courseId: string;
  userId: string;
  role: "primary" | "assistant";
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CourseInstructorAssignment> {
  assertInstructorExists(input.userId);
  const course = getCourseById(input.courseId);
  if (!course) throw new CourseValidationError("Course not found");
  const now = new Date().toISOString();
  const assignment: CourseInstructorAssignment = {
    id: generateId(),
    courseId: input.courseId,
    userId: input.userId,
    role: input.role,
    assignedAt: now,
  };

  writeCoursesDb((d) => {
    if (input.role === "primary") {
      d.instructors = d.instructors.filter(
        (i) => !(i.courseId === input.courseId && i.role === "primary"),
      );
      const idx = d.courses.findIndex((c) => c.id === input.courseId);
      const current = idx >= 0 ? d.courses[idx] : undefined;
      if (current) {
        d.courses[idx] = {
          ...current,
          primaryInstructorId: input.userId,
          updatedAt: now,
        };
      }
    } else {
      d.instructors = d.instructors.filter(
        (i) =>
          !(i.courseId === input.courseId && i.userId === input.userId && i.role === "assistant"),
      );
    }
    d.instructors.push(assignment);
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.INSTRUCTOR_ASSIGNED,
    entityType: "course",
    entityId: input.courseId,
    metadata: { userId: input.userId, role: input.role },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return assignment;
}

export async function bulkCourseAction(input: {
  action: BulkCourseAction;
  courseIds: string[];
  instructorId?: string;
  categoryId?: string | null;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ affected: number; exportRows?: CourseListItem[] }> {
  const ids = [...new Set(input.courseIds)];
  if (!ids.length) throw new CourseValidationError("No courses selected");

  let affected = 0;
  let exportRows: CourseListItem[] | undefined;

  if (input.action === "export") {
    exportRows = ids
      .map((id) => getCourseById(id))
      .filter((c): c is Course => Boolean(c))
      .map(toListItem);
    affected = exportRows.length;
  } else {
    for (const id of ids) {
      try {
        if (input.action === "publish") {
          await publishCourse(id, input.actorId, input);
          affected += 1;
        } else if (input.action === "archive") {
          await archiveCourse(id, input.actorId, input);
          affected += 1;
        } else if (input.action === "delete") {
          await softDeleteCourse(id, input.actorId, input);
          affected += 1;
        } else if (input.action === "assign_instructor") {
          if (!input.instructorId) {
            throw new CourseValidationError("instructorId required for bulk assign");
          }
          await assignInstructor({
            courseId: id,
            userId: input.instructorId,
            role: "primary",
            actorId: input.actorId,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
          });
          affected += 1;
        } else if (input.action === "change_category") {
          await updateCourse({
            id,
            patch: { categoryId: input.categoryId ?? null },
            actorId: input.actorId,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
          });
          affected += 1;
        }
      } catch {
        // continue other ids
      }
    }
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.COURSE_BULK,
    entityType: "course",
    entityId: null,
    metadata: { action: input.action, requested: ids.length, affected },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { affected, exportRows };
}

export function recountCourseDuration(courseId: string): void {
  const db = readCoursesDb();
  const lessons = db.lessons.filter((l) => l.courseId === courseId);
  const total = lessons.reduce((sum, l) => sum + l.estimatedStudyMinutes, 0);
  const modules = db.modules.filter((m) => m.courseId === courseId).length;
  writeCoursesDb((d) => {
    const idx = d.courses.findIndex((c) => c.id === courseId);
    const current = idx >= 0 ? d.courses[idx] : undefined;
    if (current) {
      d.courses[idx] = {
        ...current,
        estimatedDurationMinutes: total,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...current.metadata,
          totalLessons: lessons.length,
          totalModules: modules,
        },
      };
    }
  });
}
