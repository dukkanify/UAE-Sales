import { findUserByEmail, findUserById } from "@/services/auth/user-store";
import { getRequestLocale, type AppLocale } from "@/shared/i18n/locale";

export async function resolveEmailLocale(input?: {
  email?: string | null;
  userId?: string | null;
}): Promise<AppLocale> {
  if (input?.userId) {
    const user = await findUserById(input.userId);
    if (user?.preferredLocale === "en") return "en";
    if (user?.preferredLocale === "ar") return "ar";
  }
  if (input?.email) {
    const user = await findUserByEmail(input.email);
    if (user?.preferredLocale === "en") return "en";
    if (user?.preferredLocale === "ar") return "ar";
  }
  try {
    return await getRequestLocale();
  } catch {
    return "ar";
  }
}
