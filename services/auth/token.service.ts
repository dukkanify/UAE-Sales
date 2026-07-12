import { createHash, randomBytes } from "node:crypto";
import { loadCollection, saveCollection } from "@/services/payments/data-store";

const TOKEN_PEPPER = process.env.TOKEN_PEPPER ?? "sooqna-token-pepper";
const SETUP_TOKEN_FILE = "account-setup-tokens.json";

export const SETUP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const GUEST_ORDER_ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL_MS = 45 * 60 * 1000;

const PASSWORD_RESET_TOKEN_FILE = "password-reset-link-tokens.json";

export type PasswordResetTokenRecord = {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
};

export type AccountSetupTokenRecord = {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(`${TOKEN_PEPPER}:${token}`).digest("hex");
}

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSecureToken(token: string): string {
  return hashToken(token);
}

export async function createAccountSetupToken(input: {
  userId: string;
  email: string;
}): Promise<string> {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const now = new Date().toISOString();

  const tokens = await loadCollection<AccountSetupTokenRecord>(SETUP_TOKEN_FILE);
  const withoutUser = tokens.filter((item) => item.userId !== input.userId);
  withoutUser.unshift({
    id: `setup-${Date.now()}`,
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    tokenHash,
    expiresAt: new Date(Date.now() + SETUP_TOKEN_TTL_MS).toISOString(),
    createdAt: now,
  });
  await saveCollection(SETUP_TOKEN_FILE, withoutUser);
  return rawToken;
}

export async function consumeAccountSetupToken(
  rawToken: string,
): Promise<{ userId: string; email: string } | null> {
  const tokenHash = hashToken(rawToken);
  const tokens = await loadCollection<AccountSetupTokenRecord>(SETUP_TOKEN_FILE);
  const match = tokens.find(
    (item) =>
      item.tokenHash === tokenHash &&
      !item.consumedAt &&
      new Date(item.expiresAt).getTime() > Date.now(),
  );
  if (!match) return null;

  const updated = tokens.map((item) =>
    item.id === match.id
      ? { ...item, consumedAt: new Date().toISOString() }
      : item,
  );
  await saveCollection(SETUP_TOKEN_FILE, updated);
  return { userId: match.userId, email: match.email };
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();

  const tokens = await loadCollection<PasswordResetTokenRecord>(PASSWORD_RESET_TOKEN_FILE);
  const withoutEmail = tokens.filter((item) => item.email !== normalized);
  withoutEmail.unshift({
    id: `reset-${Date.now()}`,
    email: normalized,
    tokenHash,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS).toISOString(),
    createdAt: now,
  });
  await saveCollection(PASSWORD_RESET_TOKEN_FILE, withoutEmail);
  return rawToken;
}

export async function consumePasswordResetToken(
  rawToken: string,
): Promise<{ email: string } | null> {
  const tokenHash = hashToken(rawToken);
  const tokens = await loadCollection<PasswordResetTokenRecord>(PASSWORD_RESET_TOKEN_FILE);
  const match = tokens.find(
    (item) =>
      item.tokenHash === tokenHash &&
      !item.consumedAt &&
      new Date(item.expiresAt).getTime() > Date.now(),
  );
  if (!match) return null;

  const updated = tokens.map((item) =>
    item.id === match.id
      ? { ...item, consumedAt: new Date().toISOString() }
      : item,
  );
  await saveCollection(PASSWORD_RESET_TOKEN_FILE, updated);
  return { email: match.email };
}

export function createGuestOrderAccessToken(): {
  rawToken: string;
  tokenHash: string;
  expiresAt: string;
} {
  const rawToken = generateSecureToken();
  return {
    rawToken,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + GUEST_ORDER_ACCESS_TTL_MS).toISOString(),
  };
}

export function verifyGuestOrderAccessToken(
  rawToken: string,
  storedHash?: string,
  expiresAt?: string,
): boolean {
  if (!storedHash || !expiresAt) return false;
  if (new Date(expiresAt).getTime() <= Date.now()) return false;
  return hashToken(rawToken) === storedHash;
}
