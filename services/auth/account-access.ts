import type { AccountStatus, UserProfile } from "@/types/domain/user";

export function isMarketplaceAccountReady(
  user?: { accountStatus?: AccountStatus } | null,
): boolean {
  if (!user) return false;
  return !user.accountStatus || user.accountStatus === "active";
}

export function getAccountGatePath(user: Pick<UserProfile, "email" | "emailVerifiedAt" | "accountStatus">): string {
  if (user.accountStatus === "pending") {
    if (!user.emailVerifiedAt) {
      const params = new URLSearchParams({
        email: user.email,
        purpose: "REGISTER",
      });
      return `/verify-email?${params.toString()}`;
    }
    return "/register/pending";
  }

  if (user.accountStatus === "suspended") {
    return "/profile";
  }

  return "/profile";
}
