import { demoAccounts } from "@/mock/demo-accounts.mock";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type { AccountStatus, OnboardingStatus, StoredUser, UserProfile } from "@/types/domain/user";
import { getSafeNextPath } from "@/shared/utils/safe-next";

const FILE = "users.json";

function toProfile(user: StoredUser): UserProfile {
  const { passwordHash: _omit, ...profile } = user;
  void _omit;
  return {
    ...profile,
    hasPassword: Boolean(user.passwordHash),
  };
}

function seedDemoUsers(users: StoredUser[]): StoredUser[] {
  const emails = new Set(users.map((user) => user.email.toLowerCase()));
  const seeded = [...users];

  for (const account of demoAccounts) {
    if (emails.has(account.profile.email.toLowerCase())) continue;
    seeded.push({
      ...account.profile,
      accountStatus: "active",
      emailVerifiedAt: account.profile.joinedAt,
      onboardingStatus:
        account.profile.accountType === "company" ||
        account.profile.accountType === "business"
          ? "business_complete"
          : "none",
    });
  }

  return seeded;
}

export async function getAllUsers(): Promise<StoredUser[]> {
  const users = await loadCollection<StoredUser>(FILE);
  if (users.length === 0) {
    const seeded = seedDemoUsers([]);
    await saveCollection(FILE, seeded);
    return seeded;
  }
  return users;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const users = await getAllUsers();
  return users.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await getAllUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function saveUser(user: StoredUser): Promise<StoredUser> {
  const users = await getAllUsers();
  const next = users.filter((item) => item.id !== user.id);
  next.unshift(user);
  await saveCollection(FILE, next);
  return user;
}

export async function createPendingUser(input: {
  email: string;
  fullName: string;
  accountType: StoredUser["accountType"];
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);

  if (existing?.accountStatus === "active" && existing.emailVerifiedAt) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  const user: StoredUser = {
    id: existing?.id ?? `user-${Date.now()}`,
    fullName: input.fullName,
    email,
    phone: existing?.phone ?? "",
    city: existing?.city ?? "دبي",
    accountType: input.accountType,
    isVerified: false,
    joinedAt: existing?.joinedAt ?? new Date().toISOString().slice(0, 10),
    accountStatus: "pending" as AccountStatus,
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

export async function deletePendingUser(userId: string): Promise<void> {
  const users = await getAllUsers();
  const user = users.find((item) => item.id === userId);
  if (!user || user.accountStatus !== "pending") return;
  await saveCollection(
    FILE,
    users.filter((item) => item.id !== userId),
  );
}

export async function activateUser(userId: string): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const activated: StoredUser = {
    ...user,
    accountStatus: "active",
    emailVerifiedAt: new Date().toISOString(),
    isVerified: true,
  };

  await saveUser(activated);
  return toProfile(activated);
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<UserProfile> {
  const user = await findUserById(userId);
  if (!user) throw new Error("USER_NOT_FOUND");

  const updated: StoredUser = { ...user, passwordHash };
  await saveUser(updated);
  return toProfile(updated);
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

export function toUserProfile(user: StoredUser): UserProfile {
  return toProfile(user);
}

export async function resolveLoginUser(email: string): Promise<UserProfile | null> {
  const stored = await findUserByEmail(email);
  if (stored && stored.accountStatus === "active") {
    return toProfile(stored);
  }

  const demo = demoAccounts.find(
    (account) => account.profile.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return demo?.profile ?? null;
}

export function getRedirectAfterAuth(user: UserProfile, next?: string | null): string {
  const fallback =
    user.accountType === "company" || user.accountType === "business"
      ? user.onboardingStatus === "business_pending"
        ? "/dashboard/business-onboarding"
        : "/dashboard/listings"
      : "/profile";

  return getSafeNextPath(next, fallback);
}
