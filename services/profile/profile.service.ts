import type { UserProfile } from "@/types";
import { mockCurrentUser } from "@/mock";
import { withDataFallback } from "@/lib/data/fallback";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/repositories/auth.repository";

export async function getCurrentUser(): Promise<UserProfile> {
  return withDataFallback(
    async () => {
      const user = await getCurrentSessionUser();
      if (!user) {
        return mockCurrentUser;
      }

      const profile = await getUserProfile(user.id);
      return profile ?? mockCurrentUser;
    },
    async () => mockCurrentUser,
    "current-user",
  );
}

export async function updateUserProfileDraft(
  userId: string,
  payload: Partial<UserProfile>,
): Promise<UserProfile> {
  void userId;
  void payload;
  return getCurrentUser();
}
