/**
 * Learning communities — posts, comments, membership.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import {
  assertCanAccessCommunity,
  canModerateCommunities,
  CommunicationError,
} from "@/services/communication/access";
import { moderateText } from "@/services/communication/moderation-service";
import { notifyUsers } from "@/services/communication/notify";
import {
  readCommunicationDb,
  writeCommunicationDb,
} from "@/services/communication/store";
import type {
  AttachmentRef,
  CommentRecord,
  Community,
  CommunityKind,
  CommunityPost,
  PostVisibility,
} from "@/types/communication";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export function listCommunities(user: UserProfile, filters?: { kind?: CommunityKind | "all" }) {
  assertCanAccessCommunity(user);
  let rows = readCommunicationDb().communities.filter((c) => !c.isArchived);
  if (filters?.kind && filters.kind !== "all") {
    rows = rows.filter((c) => c.kind === filters.kind);
  }
  // Students only see communities they belong to (plus general)
  if (user.role === "student") {
    rows = rows.filter(
      (c) => c.kind === "general" || c.memberIds.includes(user.id),
    );
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCommunity(id: string): Community | null {
  return readCommunicationDb().communities.find((c) => c.id === id) ?? null;
}

export function assertCommunityMember(user: UserProfile, communityId: string): Community {
  const community = getCommunity(communityId);
  if (!community || community.isArchived) {
    throw new CommunicationError("Community not found", 404);
  }
  if (
    canModerateCommunities(user) ||
    community.memberIds.includes(user.id) ||
    community.moderatorIds.includes(user.id) ||
    community.kind === "general"
  ) {
    return community;
  }
  throw new CommunicationError("Not a community member", 403);
}

export async function createCommunity(input: {
  user: UserProfile;
  name: string;
  description: string;
  kind: CommunityKind;
  courseId?: string | null;
  instructorId?: string | null;
  subject?: string | null;
  batchLabel?: string | null;
  memberIds?: string[];
}): Promise<Community> {
  if (!canModerateCommunities(input.user) && input.user.role !== "instructor") {
    throw new CommunicationError("Cannot create community", 403);
  }
  const stamp = nowIso();
  const community: Community = {
    id: generateId(),
    name: input.name.trim(),
    slug: slugify(input.name) || generateId().slice(0, 8),
    description: input.description.trim(),
    kind: input.kind,
    courseId: input.courseId ?? null,
    instructorId: input.instructorId ?? input.user.id,
    subject: input.subject ?? null,
    batchLabel: input.batchLabel ?? null,
    memberIds: [...new Set([input.user.id, ...(input.memberIds ?? [])])],
    moderatorIds: [input.user.id],
    coverUrl: null,
    isArchived: false,
    createdById: input.user.id,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeCommunicationDb((db) => {
    db.communities.unshift(community);
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.COMMUNITY_CREATED,
    entityType: "community",
    entityId: community.id,
  });
  return community;
}

export function joinCommunity(user: UserProfile, communityId: string): Community {
  assertCanAccessCommunity(user);
  let updated: Community | null = null;
  writeCommunicationDb((db) => {
    const c = db.communities.find((x) => x.id === communityId);
    if (!c || c.isArchived) return;
    if (!c.memberIds.includes(user.id)) c.memberIds.push(user.id);
    c.updatedAt = nowIso();
    updated = { ...c, memberIds: [...c.memberIds] };
  });
  if (!updated) throw new CommunicationError("Community not found", 404);
  return updated;
}

export function listPosts(
  user: UserProfile,
  communityId: string,
  options?: { q?: string; limit?: number; offset?: number },
): CommunityPost[] {
  assertCommunityMember(user, communityId);
  let rows = readCommunicationDb().posts.filter(
    (p) => p.communityId === communityId && !p.deletedAt,
  );
  if (options?.q) {
    const q = options.q.toLowerCase();
    rows = rows.filter(
      (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );
  }
  rows.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 30;
  return rows.slice(offset, offset + limit);
}

export async function createPost(input: {
  user: UserProfile;
  communityId: string;
  title: string;
  body: string;
  visibility?: PostVisibility;
  pinned?: boolean;
  isAnnouncement?: boolean;
  attachments?: AttachmentRef[];
}): Promise<CommunityPost> {
  const community = assertCommunityMember(input.user, input.communityId);
  if (input.pinned || input.isAnnouncement) {
    if (
      !community.moderatorIds.includes(input.user.id) &&
      !canModerateCommunities(input.user)
    ) {
      throw new CommunicationError("Only moderators can pin or announce", 403);
    }
  }

  const id = generateId();
  const moderation = moderateText(input.body, {
    contentType: "post",
    contentId: id,
    actorId: input.user.id,
  });
  if (!moderation.allowed) {
    throw new CommunicationError("Post blocked by content moderation", 422);
  }

  const stamp = nowIso();
  const post: CommunityPost = {
    id,
    communityId: community.id,
    authorId: input.user.id,
    authorName: input.user.fullName || input.user.email,
    title: input.title.trim(),
    body: moderation.redactedBody ?? input.body.trim(),
    visibility: input.visibility ?? "members",
    pinned: Boolean(input.pinned),
    isAnnouncement: Boolean(input.isAnnouncement),
    attachments: input.attachments ?? [],
    likeCount: 0,
    commentCount: 0,
    moderated: moderation.flags.length > 0,
    moderationFlags: moderation.flags,
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.posts.unshift(post);
  });

  await notifyUsers(
    community.memberIds.filter((id) => id !== input.user.id).slice(0, 50),
    {
      title: input.isAnnouncement ? "Community announcement" : "New community post",
      body: `${post.authorName} posted in ${community.name}: ${post.title}`,
      type: input.isAnnouncement ? "community.announcement" : "community.post",
      data: { communityId: community.id, postId: post.id },
    },
  );

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.COMMUNITY_POST_CREATED,
    entityType: "community_post",
    entityId: post.id,
  });

  return post;
}

export function getPost(id: string): CommunityPost | null {
  return readCommunicationDb().posts.find((p) => p.id === id && !p.deletedAt) ?? null;
}

export async function addComment(input: {
  user: UserProfile;
  targetType: "community_post" | "blog_post";
  targetId: string;
  body: string;
  parentId?: string | null;
}): Promise<CommentRecord> {
  assertCanAccessCommunity(input.user);
  const id = generateId();
  const moderation = moderateText(input.body, {
    contentType: "comment",
    contentId: id,
    actorId: input.user.id,
  });
  if (!moderation.allowed) {
    throw new CommunicationError("Comment blocked by content moderation", 422);
  }

  const stamp = nowIso();
  const comment: CommentRecord = {
    id,
    targetType: input.targetType,
    targetId: input.targetId,
    parentId: input.parentId ?? null,
    authorId: input.user.id,
    authorName: input.user.fullName || input.user.email,
    body: moderation.redactedBody ?? input.body.trim(),
    moderated: moderation.flags.length > 0,
    moderationFlags: moderation.flags,
    status: moderation.flags.length ? "pending" : "visible",
    deletedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCommunicationDb((db) => {
    db.comments.unshift(comment);
    if (input.targetType === "community_post") {
      const post = db.posts.find((p) => p.id === input.targetId);
      if (post) post.commentCount += 1;
    }
    if (input.targetType === "blog_post") {
      const post = db.blogPosts.find((p) => p.id === input.targetId);
      if (post) post.commentCount += 1;
    }
  });

  return comment;
}

export function listComments(
  targetType: "community_post" | "blog_post",
  targetId: string,
): CommentRecord[] {
  return readCommunicationDb()
    .comments.filter(
      (c) =>
        c.targetType === targetType &&
        c.targetId === targetId &&
        !c.deletedAt &&
        c.status !== "hidden",
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function pinPost(user: UserProfile, postId: string, pinned: boolean) {
  if (!canModerateCommunities(user) && user.role !== "instructor") {
    throw new CommunicationError("Cannot pin posts", 403);
  }
  writeCommunicationDb((db) => {
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return;
    post.pinned = pinned;
    post.updatedAt = nowIso();
  });
}

export function moderateComment(
  user: UserProfile,
  commentId: string,
  status: "visible" | "pending" | "hidden",
) {
  if (!canModerateCommunities(user) && !canManageBlogLike(user)) {
    throw new CommunicationError("Cannot moderate comments", 403);
  }
  writeCommunicationDb((db) => {
    const c = db.comments.find((x) => x.id === commentId);
    if (!c) return;
    c.status = status;
    c.updatedAt = nowIso();
  });
}

function canManageBlogLike(user: UserProfile) {
  return user.role === "admin" || user.role === "super_admin";
}
