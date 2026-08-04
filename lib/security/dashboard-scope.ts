import { ROLES, type Role } from "@/constants/roles";

const ROLE_RANK: Record<string, number> = {
  [ROLES.STUDENT]: 0,
  [ROLES.INSTRUCTOR]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
};

/** Client may request a dashboard scope only at or below their own role. */
export function resolveDashboardScope(userRole: Role, requested: string | null): Role {
  if (!requested) return userRole;
  const reqRank = ROLE_RANK[requested];
  const userRank = ROLE_RANK[userRole] ?? -1;
  if (reqRank == null || reqRank > userRank) return userRole;
  return requested as Role;
}
