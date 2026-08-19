import { randomBytes } from "node:crypto";
import { verifyPassword } from "@/services/auth/password.service";
import {
  findInAccountVault,
  readAccountVault,
} from "@/services/auth/account-vault";
import {
  deletePersistedUser,
  findPersistedUserByEmail,
  findPersistedUserById,
  listPersistedUsers,
  persistUser,
} from "@/services/auth/user-persistence";
import type { AccountStatus, NotificationPreferences, OnboardingStatus, StoredUser, UserProfile } from "@/types/domain/user";
import { getSafeNextPath } from "@/shared/utils/safe-next";

function isPlaceholderUser(user: StoredUser): boolean {
  const email = user.email.trim().toLowerCase();
  return (
    user.registrationSource === "DEMO" ||
    email.endsWith("@sooqna.demo") ||
    email.endsWith("@uaesales.demo")
  );
}

function toProfile(user: StoredUser): UserProfile {
  const { passwordHash: _omit, ...profile } = user;
  void _omit;
  return {
    ...profile,
    hasPassword: Boolean(user.passwordHash),
  };
}

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isGuestConvertible(user: StoredUser): boolean {
  return (
    user.registrationSource === "GUEST_CHECKOUT" &&
    !user.passwordHash &&
    !user.isGuestConverted
  );
}

export function isRegisteredAccount(user: StoredUser): boolean {
  if (isGuestConvertible(user)) return false;
  return Boolean(user.passwordHash) || Boolean(user.emailVerifiedAt);
}

function newUserId(): string {
  return `user-${Date.now()}-${randomBytes(4).toString("hex")}`;
}

export async function getAllUsers(): Promise<StoredUser[]> {
  const users = await listPersistedUsers();
  return users.filter((user) => !isPlaceholderUser(user));
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = normalizeAuthEmail(email);
  const found = await findPersistedUserByEmail(normalized);
  if (found) return found;

  const vaulted = await findInAccountVault(normalized);
  if (!vaulted) return null;
  return persistUser(vaulted);
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const found = await findPersistedUserById(id);
  if (found) return found;
  const vault = await readAccountVault();
  const vaulted = vault.find((user) => user.id === id);
  if (!vaulted) return null;
  return persistUser(vaulted);
}

export async function saveUser(user: StoredUser): Promise<StoredUser> {
  return persistUser(user);
}

export async function updateNotificationPreferences(
  userId: string,
  patch: Partial<NotificationPreferences> & { locale?: "ar" | "en" },
): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  const updated: StoredUser = {
    ...user,
    locale: patch.locale ?? user.locale,
    notificationPreferences: {
      email: patch.email ?? user.notificationPreferences?.email ?? true,
      bookingUpdates:
        patch.bookingUpdates ?? user.notificationPreferences?.bookingUpdates ?? true,
      orderUpdates:
        patch.orderUpdates ?? user.notificationPreferences?.orderUpdates ?? true,
      messages: patch.messages ?? user.notificationPreferences?.messages ?? true,
      marketing: patch.marketing ?? user.notificationPreferences?.marketing ?? false,
      savedSearches:
        patch.savedSearches ?? user.notificationPreferences?.savedSearches ?? true,
    },
  };
  await saveUser(updated);
  return toProfile(updated);
}

export async function createStandardUser(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  accountType: StoredUser["accountType"];
  phone?: string;
}): Promise<StoredUser> {
  const email = normalizeAuthEmail(input.email);
  const existing = await findUserByEmail(email);

  if (existing && isRegisteredAccount(existing)) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  const now = new Date().toISOString();
  const convertingGuest = Boolean(existing && isGuestConvertible(existing));
  const user: StoredUser = {
    id: existing?.id ?? newUserId(),
    fullName: input.fullName.trim(),
    email,
    normalizedEmail: email,
    phone: input.phone?.trim() ?? existing?.phone ?? "",
    city: existing?.city || "دبي",
    accountType: input.accountType,
    isVerified: false,
    joinedAt: existing?.joinedAt ?? now.slice(0, 10),
    createdAt: existing?.createdAt ?? now,
    accountStatus: "pending",
    emailVerifiedAt: undefined,
    passwordHash: input.passwordHash,
    registrationSource: convertingGuest ? "GUEST_CHECKOUT" : "STANDARD",
    isGuestConverted: convertingGuest,
    onboardingStatus:
      input.accountType === "company" ? ("business_pending" as OnboardingStatus) : "none",
    role:
      input.accountType === "company" || input.accountType === "business"
        ? "business"
        : "user",
    walletBalance: existing?.walletBalance ?? 0,
  };

  return saveUser(user);
}

export async function createPendingUser(input: {
  email: string;
  fullName: string;
  accountType: StoredUser["accountType"];
  passwordHash?: string;
}): Promise<StoredUser> {
  const email = normalizeAuthEmail(input.email);
  const existing = await findUserByEmail(email);

  if (existing && isRegisteredAccount(existing) && !isGuestConvertible(existing)) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  const now = new Date().toISOString();
  const convertingGuest = Boolean(existing && isGuestConvertible(existing));
  const user: StoredUser = {
    id: existing?.id ?? newUserId(),
    fullName: input.fullName,
    email,
    normalizedEmail: email,
    phone: existing?.phone ?? "",
    city: existing?.city || "دبي",
    accountType: input.accountType,
    isVerified: false,
    joinedAt: existing?.joinedAt ?? now.slice(0, 10),
    createdAt: existing?.createdAt ?? now,
    accountStatus: "pending" as AccountStatus,
    onboardingStatus:
      input.accountType === "company" ? ("business_pending" as OnboardingStatus) : "none",
    role:
      input.accountType === "company" || input.accountType === "business"
        ? "business"
        : "user",
    walletBalance: existing?.walletBalance ?? 0,
    passwordHash: input.passwordHash ?? existing?.passwordHash,
    registrationSource: convertingGuest ? "GUEST_CHECKOUT" : existing?.registrationSource ?? "OTP",
    isGuestConverted: convertingGuest,
  };

  return saveUser(user);
}

export async function deletePendingUser(userId: string): Promise<void> {
  const user = await findPersistedUserById(userId);
  if (!user || user.accountStatus !== "pending") return;
  if (isRegisteredAccount(user) && user.passwordHash) return;
  await deletePersistedUser(userId);
}

export async function markPersonVerified(userId: string): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const verified: StoredUser = {
    ...user,
    emailVerifiedAt: user.emailVerifiedAt ?? new Date().toISOString(),
  };
  await saveUser(verified);
  return toProfile(verified);
}

export async function approveRegisteredUser(userId: string): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const activated: StoredUser = {
    ...user,
    accountStatus: "active",
    emailVerifiedAt: user.emailVerifiedAt,
    isVerified: true,
  };

  await saveUser(activated);
  return toProfile(activated);
}

export async function activateUser(userId: string): Promise<UserProfile> {
  return approveRegisteredUser(userId);
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const updated: StoredUser = {
    ...user,
    passwordHash,
    passwordUpdatedAt: new Date().toISOString(),
    sessionVersion: (user.sessionVersion ?? 0) + 1,
  };
  await saveUser(updated);
  return toProfile(updated);
}

/** Import a missing account into the durable store from a client/device password proof. */
export async function restoreUserWithPasswordProof(input: {
  email: string;
  password: string;
  passwordHash: string;
  fullName?: string;
  accountType?: StoredUser["accountType"];
}): Promise<StoredUser | null> {
  if (!verifyPassword(input.password, input.passwordHash)) {
    return null;
  }

  const email = normalizeAuthEmail(input.email);
  const existing = await findUserByEmail(email);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  return saveUser({
    id: newUserId(),
    fullName: input.fullName?.trim() || email.split("@")[0],
    email,
    normalizedEmail: email,
    phone: "",
    city: "دبي",
    accountType: input.accountType ?? "individual",
    isVerified: true,
    joinedAt: now.slice(0, 10),
    createdAt: now,
    accountStatus: "active",
    emailVerifiedAt: now,
    passwordHash: input.passwordHash,
    registrationSource: "STANDARD",
    isGuestConverted: false,
    onboardingStatus: input.accountType === "company" ? "business_pending" : "none",
    role:
      input.accountType === "company" || input.accountType === "business"
        ? "business"
        : "user",
    walletBalance: 0,
    notificationPreferences: {
      email: true,
      bookingUpdates: true,
      orderUpdates: true,
      messages: true,
      marketing: false,
      savedSearches: true,
    },
  });
}

export async function updateUserOnboarding(
  userId: string,
  data: Partial<StoredUser["businessProfile"]>,
): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const updated: StoredUser = {
    ...user,
    businessProfile: { ...user.businessProfile, ...data },
    onboardingStatus: "business_complete",
  };
  await saveUser(updated);
  return toProfile(updated);
}

export async function updateUserAdmin(
  userId: string,
  patch: Partial<
    Pick<StoredUser, "isVerified" | "accountStatus" | "role" | "adminPermissions">
  >,
): Promise<StoredUser | null> {
  const user = await findUserById(userId);
  if (!user) return null;
  const updated: StoredUser = {
    ...user,
    ...patch,
  };
  await saveUser(updated);
  return updated;
}

export function toAdminUserRecord(
  user: StoredUser,
  listingsCount = 0,
): {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: NonNullable<StoredUser["role"]>;
  isVerified: boolean;
  accountStatus: AccountStatus;
  emailVerifiedAt?: string | null;
  joinedAt: string;
  listingsCount: number;
  adminPermissions?: StoredUser["adminPermissions"];
} {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: user.role ?? "user",
    isVerified: user.isVerified,
    accountStatus: user.accountStatus ?? "active",
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    joinedAt: user.joinedAt,
    listingsCount,
    adminPermissions: user.adminPermissions,
  };
}

export function toUserProfile(user: StoredUser): UserProfile {
  return toProfile(user);
}

export async function resolveLoginUser(email: string): Promise<UserProfile | null> {
  const stored = await findUserByEmail(email);
  if (stored && stored.accountStatus === "active") {
    return toProfile(stored);
  }
  return null;
}

export function getRedirectAfterAuth(user: UserProfile, next?: string | null): string {
  if (user.role === "admin") {
    return getSafeNextPath(next, "/admin");
  }

  if (user.accountStatus === "pending") {
    return "/register/pending";
  }

  const fallback =
    user.accountType === "company" || user.accountType === "business"
      ? user.onboardingStatus === "business_pending"
        ? "/dashboard/business-onboarding"
        : "/dashboard/listings"
      : "/profile";

  return getSafeNextPath(next, fallback);
}
