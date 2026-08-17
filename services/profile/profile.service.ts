import { redirect } from "next/navigation";
import type { UserProfile } from "@/types";
import { getSessionFromCookie } from "@/services/auth/session-cookie";

/** Session user from httpOnly cookie — null when guest. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  return getSessionFromCookie();
}

/** Require a logged-in user or redirect to login. */
export async function requireCurrentUser(nextPath: string): Promise<UserProfile> {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function updateUserProfileDraft(
  userId: string,
  payload: Partial<UserProfile>,
): Promise<UserProfile | null> {
  void payload;
  const session = await getSessionFromCookie();
  if (!session || session.id !== userId) return session;
  return session;
}
