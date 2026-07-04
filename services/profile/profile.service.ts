import type { UserProfile } from "@/types";
import { mockCurrentUser } from "@/services/data";

export async function getCurrentUser(): Promise<UserProfile> {
  return mockCurrentUser;
}

export async function updateUserProfileDraft(
  userId: string,
  payload: Partial<UserProfile>,
): Promise<UserProfile> {
  void userId;
  void payload;
  return mockCurrentUser;
}
