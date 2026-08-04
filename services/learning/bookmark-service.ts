/**
 * Bookmarks & favorites.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { BOOKMARK_TARGET_TYPES, FAVORITE_TARGET_TYPES } from "@/constants/learning";
import { logActivity } from "@/services/auth/activity-log";
import { assertStudentEnrolled, LearningAccessError } from "@/services/learning/access";
import { recordHistory } from "@/services/learning/history-service";
import { readLearningDb, writeLearningDb } from "@/services/learning/store";
import type {
  Bookmark,
  BookmarkTargetType,
  Favorite,
  FavoriteTargetType,
} from "@/types/learning";
import type { UserProfile } from "@/types";

export function listBookmarks(studentId: string): Bookmark[] {
  return readLearningDb()
    .bookmarks.filter((b) => b.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addBookmark(input: {
  user: UserProfile;
  targetType: BookmarkTargetType;
  targetId: string;
  courseId?: string | null;
  lessonId?: string | null;
  label: string;
  metadata?: Record<string, unknown>;
}): Promise<Bookmark> {
  if (!BOOKMARK_TARGET_TYPES.includes(input.targetType)) {
    throw new LearningAccessError("Invalid bookmark type", 400);
  }
  if (input.courseId) assertStudentEnrolled(input.user, input.courseId);
  const exists = readLearningDb().bookmarks.find(
    (b) =>
      b.studentId === input.user.id &&
      b.targetType === input.targetType &&
      b.targetId === input.targetId,
  );
  if (exists) return exists;

  const bookmark: Bookmark = {
    id: generateId(),
    studentId: input.user.id,
    targetType: input.targetType,
    targetId: input.targetId,
    courseId: input.courseId ?? null,
    lessonId: input.lessonId ?? null,
    label: input.label.trim() || "Bookmark",
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  writeLearningDb((d) => {
    d.bookmarks.unshift(bookmark);
  });
  await recordHistory({
    studentId: input.user.id,
    type: "bookmark_added",
    title: `Bookmarked ${bookmark.label}`,
    courseId: input.courseId,
    lessonId: input.lessonId,
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.BOOKMARK_ADDED,
    entityType: "bookmark",
    entityId: bookmark.id,
  });
  return bookmark;
}

export async function removeBookmark(user: UserProfile, id: string): Promise<void> {
  const existing = readLearningDb().bookmarks.find(
    (b) => b.id === id && b.studentId === user.id,
  );
  if (!existing) throw new LearningAccessError("Bookmark not found", 404);
  writeLearningDb((d) => {
    d.bookmarks = d.bookmarks.filter((b) => b.id !== id);
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.BOOKMARK_REMOVED,
    entityType: "bookmark",
    entityId: id,
  });
}

export function listFavorites(studentId: string): Favorite[] {
  return readLearningDb()
    .favorites.filter((f) => f.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addFavorite(input: {
  user: UserProfile;
  targetType: FavoriteTargetType;
  targetId: string;
  courseId?: string | null;
  label: string;
}): Promise<Favorite> {
  if (!FAVORITE_TARGET_TYPES.includes(input.targetType)) {
    throw new LearningAccessError("Invalid favorite type", 400);
  }
  if (input.targetType === "course") {
    assertStudentEnrolled(input.user, input.targetId);
  } else if (input.courseId) {
    assertStudentEnrolled(input.user, input.courseId);
  }
  const exists = readLearningDb().favorites.find(
    (f) =>
      f.studentId === input.user.id &&
      f.targetType === input.targetType &&
      f.targetId === input.targetId,
  );
  if (exists) return exists;

  const favorite: Favorite = {
    id: generateId(),
    studentId: input.user.id,
    targetType: input.targetType,
    targetId: input.targetId,
    courseId: input.courseId ?? (input.targetType === "course" ? input.targetId : null),
    label: input.label.trim() || "Favorite",
    createdAt: new Date().toISOString(),
  };
  writeLearningDb((d) => {
    d.favorites.unshift(favorite);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.FAVORITE_ADDED,
    entityType: "favorite",
    entityId: favorite.id,
  });
  return favorite;
}

export async function removeFavorite(user: UserProfile, id: string): Promise<void> {
  const existing = readLearningDb().favorites.find(
    (f) => f.id === id && f.studentId === user.id,
  );
  if (!existing) throw new LearningAccessError("Favorite not found", 404);
  writeLearningDb((d) => {
    d.favorites = d.favorites.filter((f) => f.id !== id);
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.FAVORITE_REMOVED,
    entityType: "favorite",
    entityId: id,
  });
}
