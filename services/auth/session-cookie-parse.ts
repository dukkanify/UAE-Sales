import type { UserProfile } from "@/types";

/** Parse session cookie payload; tolerate URI-encoded JSON from some clients. */
export function parseSessionCookieValue(
  raw: string | undefined | null,
): UserProfile | null {
  if (!raw) return null;

  const candidates = [raw];
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded !== raw) candidates.push(decoded);
  } catch {
    // ignore malformed URI sequences
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as UserProfile;
    } catch {
      // try next candidate
    }
  }

  return null;
}
