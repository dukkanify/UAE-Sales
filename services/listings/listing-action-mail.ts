import { findUserById } from "@/services/auth/user-store";
import { getAppUrl } from "@/shared/constants/site";

export function listingPublicUrl(input: {
  listingId?: string;
  listingSlug?: string;
}): string {
  const base = getAppUrl();
  if (input.listingId?.startsWith("local-")) {
    return `${base}/listings/local/${input.listingId}`;
  }
  if (input.listingSlug) {
    return `${base}/listings/${input.listingSlug}`;
  }
  return `${base}/search`;
}

export async function findStoredEmail(userId: string): Promise<string | null> {
  const user = await findUserById(userId);
  const email = user?.email?.trim();
  return email || null;
}
