/**
 * Communication Center access helpers + enterprise messaging peer matrix.
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

const STAFF = new Set<string>([
  ROLES.INSTRUCTOR,
  ROLES.CHIEF_GROUND_INSTRUCTOR,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
]);

export function isStaffRole(role: string): boolean {
  return STAFF.has(role);
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

/**
 * Enterprise peer rules (directory must stay in lockstep):
 * - Students: instructors, CGI, admin, support/super_admin — NEVER other students
 * - Instructors: assigned students + CGI + admin + support
 * - CGI: instructors, students, admin, support
 * - Admin / Super Admin: everyone
 */
export function assertCanMessagePeer(actor: UserProfile, peerRole: string) {
  assertCanMessage(actor);
  if (actor.role === ROLES.SUPER_ADMIN || actor.role === ROLES.ADMIN) return;

  if (actor.role === ROLES.STUDENT) {
    if (peerRole === ROLES.STUDENT) {
      throw new CommunicationError("Students cannot message other students", 403);
    }
    if (isStaffRole(peerRole)) return;
    throw new CommunicationError("Not allowed to message this user", 403);
  }

  if (actor.role === ROLES.INSTRUCTOR) {
    // Assigned students + CGI + admin/support — not peer instructors
    if (
      peerRole === ROLES.STUDENT ||
      peerRole === ROLES.CHIEF_GROUND_INSTRUCTOR ||
      peerRole === ROLES.ADMIN ||
      peerRole === ROLES.SUPER_ADMIN
    ) {
      return;
    }
    throw new CommunicationError("Not allowed to message this user", 403);
  }

  if (actor.role === ROLES.CHIEF_GROUND_INSTRUCTOR) {
    if (
      peerRole === ROLES.STUDENT ||
      peerRole === ROLES.INSTRUCTOR ||
      peerRole === ROLES.ADMIN ||
      peerRole === ROLES.SUPER_ADMIN ||
      peerRole === ROLES.CHIEF_GROUND_INSTRUCTOR
    ) {
      return;
    }
    throw new CommunicationError("Not allowed to message this user", 403);
  }

  throw new CommunicationError("Not allowed to message this user", 403);
}
