/**
 * Communication Center access helpers.
 */

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import type { UserProfile } from "@/types";

export class CommunicationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CommunicationError";
    this.status = status;
  }
}

export function canModerateCommunities(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.COMMUNITIES_MODERATE);
}

export function canManageBlog(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.BLOG_MANAGE);
}

export function canMessage(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.MESSAGING_OWN);
}

export function canManageMessaging(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.MESSAGING_MANAGE);
}

export function canAccessCommunity(user: UserProfile): boolean {
  return (
    hasPermission(user.role, PERMISSIONS.COMMUNITY_ACCESS) ||
    canModerateCommunities(user) ||
    user.role === ROLES.INSTRUCTOR ||
    user.role === ROLES.ADMIN ||
    user.role === ROLES.SUPER_ADMIN
  );
}

export function canManageAnnouncements(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.ANNOUNCEMENTS_MANAGE);
}

export function canOwnSupport(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.SUPPORT_OWN);
}

export function canManageSupport(user: UserProfile): boolean {
  return hasPermission(user.role, PERMISSIONS.SUPPORT_MANAGE);
}

export function assertCanMessage(user: UserProfile) {
  if (!canMessage(user)) throw new CommunicationError("Messaging permission required", 403);
}

export function assertCanAccessCommunity(user: UserProfile) {
  if (!canAccessCommunity(user)) {
    throw new CommunicationError("Community access required", 403);
  }
}

export function assertCanManageBlog(user: UserProfile) {
  if (!canManageBlog(user)) throw new CommunicationError("Blog management required", 403);
}

export function assertCanModerate(user: UserProfile) {
  if (!canModerateCommunities(user) && !canManageMessaging(user)) {
    throw new CommunicationError("Moderation permission required", 403);
  }
}

export function assertCanManageAnnouncements(user: UserProfile) {
  if (!canManageAnnouncements(user)) {
    throw new CommunicationError("Announcement permission required", 403);
  }
}

export function assertCanOwnSupport(user: UserProfile) {
  if (!canOwnSupport(user) && !canManageSupport(user)) {
    throw new CommunicationError("Support access required", 403);
  }
}

export function assertCanManageSupport(user: UserProfile) {
  if (!canManageSupport(user)) throw new CommunicationError("Support management required", 403);
}

/** Direct messaging peer rules */
export function assertCanMessagePeer(actor: UserProfile, peerRole: string) {
  assertCanMessage(actor);
  if (actor.role === ROLES.SUPER_ADMIN) return;
  if (actor.role === ROLES.ADMIN) return;
  if (actor.role === ROLES.INSTRUCTOR) {
    if (peerRole === ROLES.STUDENT || peerRole === ROLES.INSTRUCTOR || peerRole === ROLES.ADMIN) {
      return;
    }
  }
  if (actor.role === ROLES.STUDENT) {
    if (peerRole === ROLES.INSTRUCTOR || peerRole === ROLES.ADMIN || peerRole === ROLES.STUDENT) {
      return;
    }
  }
  throw new CommunicationError("Not allowed to message this user", 403);
}
