import { cookies } from "next/headers";
import type { StoredUser } from "@/types/domain/user";
import { getSessionCookieOptions } from "@/services/auth/session-cookie";

export const ACCOUNT_VAULT_COOKIE = "sooqna_accounts";
const MAX_VAULT_ACCOUNTS = 8;

function parseVault(raw: string | undefined): StoredUser[] {
  if (!raw) return [];
  const candidates = [raw];
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded !== raw) candidates.push(decoded);
  } catch {
    // ignore
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (!Array.isArray(parsed)) continue;
      return parsed.filter(
        (item): item is StoredUser =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof (item as StoredUser).email === "string" &&
              typeof (item as StoredUser).id === "string",
          ),
      );
    } catch {
      // try next
    }
  }
  return [];
}

function shouldVault(user: StoredUser): boolean {
  if (!user.passwordHash) return false;
  if (user.registrationSource === "DEMO") return false;
  return true;
}

export async function readAccountVault(): Promise<StoredUser[]> {
  try {
    const store = await cookies();
    return parseVault(store.get(ACCOUNT_VAULT_COOKIE)?.value);
  } catch {
    return [];
  }
}

export async function writeAccountVault(users: StoredUser[]): Promise<void> {
  const vaulted = users.filter(shouldVault).slice(0, MAX_VAULT_ACCOUNTS);
  try {
    const store = await cookies();
    store.set(ACCOUNT_VAULT_COOKIE, JSON.stringify(vaulted), {
      ...(await getSessionCookieOptions()),
      maxAge: 60 * 60 * 24 * 180,
    });
  } catch {
    // Request context may be unavailable (webhooks, background).
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
}

export async function findInAccountVault(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const vault = await readAccountVault();
  return (
    vault.find((user) => user.email.toLowerCase() === normalized) ?? null
  );
}
