import { demoAccounts } from "@/mock/demo-accounts.mock";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import { hashPassword } from "@/services/auth/password.service";
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
      role: account.role,
      passwordHash: hashPassword(account.password),
      accountStatus: "active",
      emailVerifiedAt: account.profile.joinedAt,
      registrationSource: "DEMO",
      onboardingStatus:
        account.profile.accountType === "company" ||
        account.profile.accountType === "business"
          ? "business_complete"
          : "none",
    });
  }

  return seeded;
}

function ensureDemoUsers(users: StoredUser[]): StoredUser[] {
  const byEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));
  let changed = false;

  for (const account of demoAccounts) {
    const email = account.profile.email.toLowerCase();
    const existing = byEmail.get(email);

    if (!existing) {
      byEmail.set(email, {
        ...account.profile,
        role: account.role,
        passwordHash: hashPassword(account.password),
        accountStatus: "active",
        emailVerifiedAt: account.profile.joinedAt,
        registrationSource: "DEMO",
        onboardingStatus:
          account.profile.accountType === "company" ||
          account.profile.accountType === "business"
            ? "business_complete"
            : "none",
      });
      changed = true;
      continue;
    }

    const needsPassword = !existing.passwordHash;
    const needsRole = existing.role !== account.role;

    if (needsPassword || needsRole) {
      byEmail.set(email, {
        ...existing,
        role: account.role,
        ...(needsPassword ? { passwordHash: hashPassword(account.password) } : {}),
        accountStatus: existing.accountStatus ?? "active",
        registrationSource: existing.registrationSource ?? "DEMO",
      });
      changed = true;
    }
  }

  return changed ? Array.from(byEmail.values()) : users;
}

export async function getAllUsers(): Promise<StoredUser[]> {
  const users = await loadCollection<StoredUser>(FILE);
  if (users.length === 0) {
    const seeded = seedDemoUsers([]);
    await saveCollection(FILE, seeded);
    return seeded;
  }

  const ensured = ensureDemoUsers(users);
  if (ensured !== users) {
    await saveCollection(FILE, ensured);
    return ensured;
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

export async function createStandardUser(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  accountType: StoredUser["accountType"];
  phone?: string;
}): Promise<StoredUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);

  if (existing?.accountStatus === "active") {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: existing?.id ?? `user-${Date.now()}`,
    fullName: input.fullName.trim(),
    email,
    normalizedEmail: email,
    phone: input.phone?.trim() ?? "",
    city: existing?.city ?? "دبي",
    accountType: input.accountType,
    isVerified: true,
    joinedAt: now.slice(0, 10),
    accountStatus: "active",
    emailVerifiedAt: now,
    passwordHash: input.passwordHash,
    registrationSource: "STANDARD",
    isGuestConverted: false,
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

export async function updateUserAdmin(
  userId: string,
  patch: Partial<Pick<StoredUser, "isVerified" | "accountStatus" | "role">>,
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
  joinedAt: string;
  listingsCount: number;
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
    joinedAt: user.joinedAt,
    listingsCount,
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

  const demo = demoAccounts.find(
    (account) => account.profile.email.toLowerCase() === email.trim().toLowerCase(),
  );
  return demo?.profile ?? null;
}

export function getRedirectAfterAuth(user: UserProfile, next?: string | null): string {
  if (user.role === "admin") {
    return getSafeNextPath(next, "/admin");
  }

  const fallback =
    user.accountType === "company" || user.accountType === "business"
      ? user.onboardingStatus === "business_pending"
        ? "/dashboard/business-onboarding"
        : "/dashboard/listings"
      : "/profile";

  return getSafeNextPath(next, fallback);
}
