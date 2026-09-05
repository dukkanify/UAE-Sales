import { cookies } from "next/headers";
import type { StoredUser } from "@/types/domain/user";
import { getSessionCookieOptions } from "@/services/auth/session-cookie";

export const ACCOUNT_VAULT_COOKIE = "sooqna_accounts";
export const ACCOUNT_PROOF_COOKIE = "sooqna_proof";
const MAX_VAULT_ACCOUNTS = 8;

type VaultAccount = Pick<
  StoredUser,
  | "id"
  | "email"
  | "fullName"
  | "phone"
  | "city"
  | "accountType"
  | "role"
  | "accountStatus"
  | "passwordHash"
  | "joinedAt"
  | "registrationSource"
  | "isVerified"
>;

type ProofCookie = {
  email: string;
  passwordHash: string;
  fullName?: string;
  accountType?: StoredUser["accountType"];
};

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  const candidates = [raw];
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded !== raw) candidates.push(decoded);
  } catch {
    // ignore
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try next
    }
  }
  return null;
}

function toVaultAccount(user: StoredUser): VaultAccount {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone ?? "",
    city: user.city ?? "دبي",
    accountType: user.accountType,
    role: user.role,
    accountStatus: user.accountStatus ?? "active",
    passwordHash: user.passwordHash,
    joinedAt: user.joinedAt,
    registrationSource: user.registrationSource,
    isVerified: user.isVerified,
  };
}

function fromVaultAccount(account: VaultAccount): StoredUser {
  return {
    ...account,
    phone: account.phone ?? "",
    city: account.city ?? "دبي",
    isVerified: account.isVerified ?? true,
    accountStatus: account.accountStatus ?? "active",
  };
}

function shouldVault(user: StoredUser): boolean {
  if (!user.passwordHash) return false;
  if (user.registrationSource === "DEMO") return false;
  return true;
}

async function cookieOptions(maxAge: number) {
  return {
    ...(await getSessionCookieOptions()),
    maxAge,
  };
}

export async function readAccountVault(): Promise<StoredUser[]> {
  try {
    const store = await cookies();
    const parsed = parseJson<VaultAccount[]>(store.get(ACCOUNT_VAULT_COOKIE)?.value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.email === "string" &&
          typeof item.id === "string" &&
          typeof item.passwordHash === "string",
      )
      .map(fromVaultAccount);
  } catch {
    return [];
  }
}

export async function writeAccountVault(users: StoredUser[]): Promise<void> {
  const vaulted = users.filter(shouldVault).map(toVaultAccount).slice(0, MAX_VAULT_ACCOUNTS);
  try {
    const store = await cookies();
    store.set(
      ACCOUNT_VAULT_COOKIE,
      JSON.stringify(vaulted),
      await cookieOptions(60 * 60 * 24 * 180),
    );
  } catch {
    // Request context may be unavailable.
  }
}

export async function upsertAccountVault(user: StoredUser): Promise<void> {
  if (!shouldVault(user)) return;
  const current = await readAccountVault();
  const next = [
    user,
    ...current.filter(
      (item) =>
        item.id !== user.id &&
        item.email.toLowerCase() !== user.email.toLowerCase(),
    ),
  ];
  await writeAccountVault(next);
  await writeAccountProofCookie({
    email: user.email,
    passwordHash: user.passwordHash!,
    fullName: user.fullName,
    accountType: user.accountType,
  });
}

export async function findInAccountVault(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const vault = await readAccountVault();
  return vault.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

export async function writeAccountProofCookie(proof: ProofCookie): Promise<void> {
  try {
    const store = await cookies();
    store.set(
      ACCOUNT_PROOF_COOKIE,
      JSON.stringify({
        email: proof.email.trim().toLowerCase(),
        passwordHash: proof.passwordHash,
        fullName: proof.fullName,
        accountType: proof.accountType,
      }),
      await cookieOptions(60 * 60 * 24 * 180),
    );
  } catch {
    // ignore
  }
}

export async function readAccountProofCookie(
  email: string,
): Promise<ProofCookie | null> {
  try {
    const store = await cookies();
    const parsed = parseJson<ProofCookie>(store.get(ACCOUNT_PROOF_COOKIE)?.value);
    if (!parsed?.email || !parsed.passwordHash) return null;
    if (parsed.email.toLowerCase() !== email.trim().toLowerCase()) return null;
    return parsed;
  } catch {
    return null;
  }
}
