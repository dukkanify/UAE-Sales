import { redirect } from "next/navigation";
import type { UserProfile } from "@/types";
import { getValidSessionUser } from "@/services/auth/require-session";

/** Session user from signed cookie + DB — null when guest. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  return getValidSessionUser();
}

/** Require a logged-in user or redirect to login. */
export async function requireCurrentUser(nextPath: string): Promise<UserProfile> {
  const user = await getValidSessionUser();
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
  const session = await getValidSessionUser();
  if (!session || session.id !== userId) return session;
  return session;
}
