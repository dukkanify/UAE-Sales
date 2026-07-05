import type { User, UserRole } from "@prisma/client";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { ApiHttpError } from "@/lib/api/response";

export async function requireAuth(): Promise<User> {
  const user = await getCurrentSessionUser();
  if (!user) {
    throw new ApiHttpError(401, "UNAUTHORIZED", "يجب تسجيل الدخول أولاً.");
  }
  if (user.suspended) {
    throw new ApiHttpError(403, "FORBIDDEN", "تم إيقاف هذا الحساب.");
  }
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new ApiHttpError(403, "FORBIDDEN", "ليس لديك صلاحية للوصول.");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole(["ADMIN"]);
}
