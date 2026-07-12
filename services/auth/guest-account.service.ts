import { findUserByEmail, saveUser } from "@/services/auth/user-store";
import type { RegistrationSource, StoredUser } from "@/types/domain/user";
import { normalizeUaePhone } from "@/shared/utils/phone";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createProvisionalGuestAccount(input: {
  email: string;
  fullName: string;
  phone: string;
}): Promise<StoredUser> {
  const email = normalizeEmail(input.email);
  const existing = await findUserByEmail(email);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: input.fullName.trim(),
    email,
    normalizedEmail: email,
    phone: normalizeUaePhone(input.phone),
    city: "",
    accountType: "individual",
    isVerified: false,
    joinedAt: now.slice(0, 10),
    accountStatus: "active",
    emailVerifiedAt: null,
    passwordHash: null,
    registrationSource: "GUEST_CHECKOUT" as RegistrationSource,
    isGuestConverted: false,
    onboardingStatus: "none",
    role: "user",
    walletBalance: 0,
  };

  return saveUser(user);
}

export async function markGuestConverted(
  userId: string,
  passwordHash: string,
  verifyEmail = true,
): Promise<StoredUser | null> {
  const { findUserById } = await import("@/services/auth/user-store");
  const user = await findUserById(userId);
  if (!user) return null;

  const updated: StoredUser = {
    ...user,
    passwordHash,
    isGuestConverted: true,
    emailVerifiedAt: verifyEmail ? new Date().toISOString() : user.emailVerifiedAt,
    isVerified: verifyEmail ? true : user.isVerified,
  };
  return saveUser(updated);
}

export async function emailHasActiveAccount(email: string): Promise<boolean> {
  const user = await findUserByEmail(normalizeEmail(email));
  return Boolean(user?.accountStatus === "active");
}
